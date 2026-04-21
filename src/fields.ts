import type { SSEEvent } from "./structure";

function containsNull(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    if (value.charCodeAt(i) === 0)
      return true;
  }
  return false;
}

export function parseSSEFields(fields: string[]): SSEEvent | null {
  let eventType: string | undefined;
  let id: string | undefined;
  let retry: number | undefined;
  let dataBuffer = "";
  let hasData = false;

  for (const line of fields) {
    if (line.length === 0)
      continue;
    if (line.charCodeAt(0) === 0x3A /* : */)
      continue;

    const colonIndex = line.indexOf(":");
    let name: string;
    let value: string;
    if (colonIndex === -1) {
      name = line;
      value = "";
    }
    else {
      name = line.slice(0, colonIndex);
      value = line.slice(colonIndex + 1);
      if (value.charCodeAt(0) === 0x20 /* space */)
        value = value.slice(1);
    }

    switch (name) {
      case "event":
        eventType = value;
        break;
      case "data":
        dataBuffer += `${value}\n`;
        hasData = true;
        break;
      case "id":
        if (!containsNull(value))
          id = value;
        break;
      case "retry":
        if (/^\d+$/.test(value))
          retry = Number(value);
        break;
      default:
        break;
    }
  }

  if (!hasData)
    return null;

  const data = dataBuffer.endsWith("\n") ? dataBuffer.slice(0, -1) : dataBuffer;
  const result: SSEEvent = { data };
  if (eventType !== undefined)
    result.event = eventType;
  if (id !== undefined)
    result.id = id;
  if (retry !== undefined)
    result.retry = retry;
  return result;
}
