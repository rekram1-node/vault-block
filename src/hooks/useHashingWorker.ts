import {
  type WorkerInput,
  type WorkerOutput,
} from "~/lib/worker/hashingWorker";
import hashingWorker from "~/lib/worker/hashingWorker?worker";

export const useHashingWorker = (
  message: WorkerInput,
): Promise<WorkerOutput> => {
  return new Promise((resolve) => {
    const worker = new hashingWorker();

    worker.postMessage(message);

    worker.addEventListener("message", (msg: MessageEvent<WorkerOutput>) => {
      const { masterKey, masterPasswordHash } = msg.data;
      resolve({ masterKey, masterPasswordHash });
      worker.terminate();
    });

    // TODO: error handling
    //   worker.addEventListener("error", (error) => {
    //     reject(error);
    //     worker.terminate();
    //   });
  });
};
