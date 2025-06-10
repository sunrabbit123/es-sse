import { describe, it, expect } from 'vitest';
import { parseSSEFields } from './fields';

describe('parseSSEFields', () => {
    it('should parse event field correctly', () => {
        const fields = ['event: test-event'];
        const result = parseSSEFields(fields);
        expect(result.event).toBe('test-event');
    });

    it('should parse data field correctly', () => {
        const fields = ['data: test-data'];
        const result = parseSSEFields(fields);
        expect(result.data).toBe('test-data');
    });

    it('should handle data field containing "data:" string', () => {
        const fields = ['data: this is a data: field'];
        const result = parseSSEFields(fields);
        expect(result.data).toBe('this is a data: field');
    });

    it('should concatenate multiple data fields with newline', () => {
        const fields = ['data: first-line', 'data: second-line'];
        const result = parseSSEFields(fields);
        expect(result.data).toBe('first-line\nsecond-line');
    });

    it('should handle multiple data fields with "data:" string', () => {
        const fields = ['data: first data: line', 'data: second data: line'];
        const result = parseSSEFields(fields);
        expect(result.data).toBe('first data: line\nsecond data: line');
    });

    it('should parse id field correctly', () => {
        const fields = ['id: 123'];
        const result = parseSSEFields(fields);
        expect(result.id).toBe('123');
    });

    it('should parse retry field as number', () => {
        const fields = ['retry: 5000'];
        const result = parseSSEFields(fields);
        expect(result.retry).toBe(5000);
    });

    it('should handle multiple fields correctly', () => {
        const fields = [
            'event: test-event',
            'data: test-data',
            'id: 123',
            'retry: 5000'
        ];
        const result = parseSSEFields(fields);
        expect(result).toEqual({
            event: 'test-event',
            data: 'test-data',
            id: '123',
            retry: 5000
        });
    });

    it('should ignore unknown fields', () => {
        const fields = ['unknown: value', 'event: test-event'];
        const result = parseSSEFields(fields);
        expect(result.event).toBe('test-event');
        expect(result).not.toHaveProperty('unknown');
    });

    it('should handle empty fields array', () => {
        const result = parseSSEFields([]);
        expect(result).toEqual({});
    });
});
