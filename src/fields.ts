import type { SSEEvent } from "./structure";

const sep = ": ";
export function parseSSEFields(fields: string[]): SSEEvent {
  const result: SSEEvent = {};

  fields.forEach((field) => {
    const [key, ...values] = field.split(sep);
    const value = values.join(sep);
    switch (key) {
      case "event":
        result.event = value;
        break;
      case "data":
        if (result.data !== undefined) {
          result.data += `\n${value}`;
          break;
        }
        result.data = value;
        break;
      case "id":
        result.id = value;
        break;
      case "retry":
        result.retry = Number(value);
        break;
      case undefined:
      default:
        break;
    }
  });

  return result;
}
