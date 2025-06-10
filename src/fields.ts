import { SSEEvent } from "./structure";

export const parseSSEFields = (fields: string[]): SSEEvent => {
    const result: SSEEvent = {};

    fields.forEach((field) => {
        const [key, value] = field.split(':');
        switch (key) {
            case "event":
                result.event = value;
                break;
            case "data":
                if(result.data) {
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
        default:
            break;
        }
    });

    return result;
}