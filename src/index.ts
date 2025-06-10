import { parseSSEFields } from "./fields";
import { ParseResult } from "./structure";


export const parseSSE = (eventChunk: string): ParseResult => {
    const eventList = eventChunk.split('\n\n');
    const restString = eventList.at(-1) !== "" ?( eventList.pop() ?? "" ): "";

    const data = eventList.map((event) => {
        const eventFields = event.split('\n');
        return parseSSEFields(eventFields);    
    });

    return {
        restString,
        data,
    };
}
