// TODO: ensure this code actually works
// I was lazy with chatgpt and it may spin up more processes than intended
import { type Operation } from "rfc6902";
import { type JSONContent } from "novel";
import { encryptData, decryptData } from "./encryption/encryption";

export async function processWithWorkerPool(
  tasks: (() => Promise<void>)[],
  concurrency: number,
): Promise<void> {
  const workers: Promise<void>[] = [];
  for (let i = 0; i < concurrency; i++) {
    workers.push(
      (async function worker() {
        while (tasks.length > 0) {
          const task = tasks.shift();
          if (task) await task();
        }
      })(),
    );
  }
  await Promise.all(workers);
}

export async function encryptTextBlocks(
  jsonContent: JSONContent,
  iv: Uint8Array,
  key: Uint8Array,
  concurrency: number,
): Promise<JSONContent> {
  const tasks: (() => Promise<void>)[] = [];

  async function traverseAndEncrypt(content: JSONContent): Promise<void> {
    if (content.text !== undefined) {
      const text = content.text;
      tasks.push(async () => {
        content.text = await encryptData(text, iv, key);
      });
    }
    if (content.content && Array.isArray(content.content)) {
      await Promise.all(
        content.content.map(async (child) => {
          await traverseAndEncrypt(child);
        }),
      );
    }
  }

  await traverseAndEncrypt(jsonContent);

  // Process tasks with a worker pool
  await processWithWorkerPool(tasks, concurrency);

  return jsonContent;
}

export async function decryptTextBlocks(
  jsonContent: JSONContent,
  iv: Uint8Array,
  key: Uint8Array,
  concurrency: number,
): Promise<JSONContent> {
  const json = structuredClone(jsonContent);
  const tasks: (() => Promise<void>)[] = [];

  function collectDecryptionTasks(content: JSONContent): void {
    if (content?.text !== undefined) {
      const text = content.text;
      tasks.push(async () => {
        try {
          content.text = await decryptData(text, iv, key);
        } catch (e) {
          console.error(`Failed to decrypt "${text}" with error: ${String(e)}`);
        }
      });
    }

    if (content?.content && Array.isArray(content.content)) {
      for (const child of content.content) {
        collectDecryptionTasks(child);
      }
    }
  }

  collectDecryptionTasks(json);

  // Process tasks with a worker pool
  await processWithWorkerPool(tasks, concurrency);

  return json;
}

async function traverseAndEncryptValue(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  iv: Uint8Array,
  key: Uint8Array,
  tasks: (() => Promise<void>)[],
): Promise<void> {
  if (typeof value === "object" && value !== null) {
    if (Array.isArray(value)) {
      await Promise.all(
        value.map(async (child) =>
          traverseAndEncryptValue(child, iv, key, tasks),
        ),
      );
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      for (const [keyName, val] of Object.entries(value)) {
        if (keyName === "text" && typeof val === "string") {
          tasks.push(async () => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            value[keyName] = await encryptData(val, iv, key);
          });
        } else if (typeof val === "object") {
          await traverseAndEncryptValue(val, iv, key, tasks);
        }
      }
    }
  }
}

export async function encryptOperationArray(
  operations: Operation[],
  iv: Uint8Array,
  key: Uint8Array,
  concurrency: number,
): Promise<Operation[]> {
  const tasks: (() => Promise<void>)[] = [];

  for (const operation of operations) {
    if ("value" in operation && operation.value !== undefined) {
      await traverseAndEncryptValue(operation.value, iv, key, tasks);
    }
  }

  // Process tasks with a worker pool
  await processWithWorkerPool(tasks, concurrency);

  return operations;
}
