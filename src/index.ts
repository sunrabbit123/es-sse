import type { ParseResult } from "./structure";
import { parseSSEFields } from "./fields";

export function parseSSE(eventChunk: string): ParseResult {
  const eventList = eventChunk.split("\n\n");
  const restString = eventList.pop()!;

  const data = eventList.map((event) => {
    const eventFields = event.split("\n");
    return parseSSEFields(eventFields);
  });

  return {
    restString,
    data,
  };
}
