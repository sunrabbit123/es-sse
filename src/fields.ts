import { SSEEvent } from "./structure";

const sep = ': ';
export const parseSSEFields = (fields: string[]): SSEEvent => {
    const result: SSEEvent = {};

    fields.forEach((field) => {
        const [key, ...values] = field.split(sep);
        const value = values.join(sep);
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