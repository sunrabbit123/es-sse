import type { ParseResult, SSEEvent } from "./structure";
import { parseSSEFields } from "./fields";

export function parseSSE(eventChunk: string): ParseResult {
  let chunk = eventChunk;

  // Per spec, a leading U+FEFF BYTE ORDER MARK must be ignored.
  if (chunk.charCodeAt(0) === 0xFEFF)
    chunk = chunk.slice(1);

  // A trailing lone CR may be the first half of an unfinished CRLF pair in a
  // later chunk. Hold it back so it reaches restString intact. When the
  // previous character is already CR, the trailing CR can only be a plain CR
  // line terminator (CRLF requires CR+LF), so there is no ambiguity to resolve.
  let trailing = "";
  const lastIndex = chunk.length - 1;
  if (
    chunk.charCodeAt(lastIndex) === 0x0D /* CR */
    && chunk.charCodeAt(lastIndex - 1) !== 0x0D
  ) {
    trailing = "\r";
    chunk = chunk.slice(0, -1);
  }

  // Normalize line terminators: CRLF and lone CR both collapse to LF.
  chunk = chunk.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const eventList = chunk.split("\n\n");
  const restString = eventList.pop()! + trailing;

  const data: SSEEvent[] = [];
  for (const event of eventList) {
    const parsed = parseSSEFields(event.split("\n"));
    if (parsed !== null)
      data.push(parsed);
  }

  return {
    restString,
    data,
  };
}
