import { z } from "zod";

const AddOperation = z.object({
  op: z.literal("add"),
  path: z.string(),
  value: z.any(),
});

const RemoveOperation = z.object({
  op: z.literal("remove"),
  path: z.string(),
});

const ReplaceOperation = z.object({
  op: z.literal("replace"),
  path: z.string(),
  value: z.any(),
});

const MoveOperation = z.object({
  op: z.literal("move"),
  from: z.string(),
  path: z.string(),
});

const CopyOperation = z.object({
  op: z.literal("copy"),
  from: z.string(),
  path: z.string(),
});

const TestOperation = z.object({
  op: z.literal("test"),
  path: z.string(),
  value: z.any(),
});

const Operation = z.union([
  AddOperation,
  RemoveOperation,
  ReplaceOperation,
  MoveOperation,
  CopyOperation,
  TestOperation,
]);

export const OperationsSchema = z.array(Operation);
