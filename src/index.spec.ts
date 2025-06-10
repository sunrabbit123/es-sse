import { describe, it, expect } from 'vitest';
import { parseSSE } from './index';

describe('parseSSE', () => {
    it('should parse single event correctly', () => {
        const eventChunk = 'event: test-event\ndata: test-data\n\n';
        const result = parseSSE(eventChunk);
        expect(result.data).toHaveLength(1);
        expect(result.data[0]).toEqual({
            event: 'test-event',
            data: 'test-data'
        });
        expect(result.restString).toBe('');
    });

    it('should parse multiple events correctly', () => {
        const eventChunk = 'event: event1\ndata: data1\n\nevent: event2\ndata: data2\n\n';
        const result = parseSSE(eventChunk);
        expect(result.data).toHaveLength(2);
        expect(result.data[0]).toEqual({
            event: 'event1',
            data: 'data1'
        });
        expect(result.data[1]).toEqual({
            event: 'event2',
            data: 'data2'
        });
        expect(result.restString).toBe('');
    });

    it('should handle incomplete event in restString', () => {
        const eventChunk = 'event: test-event\ndata: test-data\n\nevent: incomplete';
        const result = parseSSE(eventChunk);
        expect(result.data).toHaveLength(1);
        expect(result.data[0]).toEqual({
            event: 'test-event',
            data: 'test-data'
        });
        expect(result.restString).toBe('event: incomplete');
    });

    it('should handle empty event chunk', () => {
        const result = parseSSE('');
        expect(result.data).toHaveLength(0);
        expect(result.restString).toBe('');
    });

    it('should handle event chunk with only restString', () => {
        const eventChunk = 'event: incomplete';
        const result = parseSSE(eventChunk);
        expect(result.data).toHaveLength(0);
        expect(result.restString).toBe('event: incomplete');
    });

    it('should handle multiple line data fields', () => {
        const eventChunk = 'event: test-event\ndata: line1\ndata: line2\n\n';
        const result = parseSSE(eventChunk);
        expect(result.data).toHaveLength(1);
        expect(result.data[0]).toEqual({
            event: 'test-event',
            data: 'line1\nline2'
        });
        expect(result.restString).toBe('');
    });

    it('should handle complex event with all fields', () => {
        const eventChunk = 'event: test-event\ndata: test-data\nid: 123\nretry: 5000\n\n';
        const result = parseSSE(eventChunk);
        expect(result.data).toHaveLength(1);
        expect(result.data[0]).toEqual({
            event: 'test-event',
            data: 'test-data',
            id: '123',
            retry: 5000
        });
        expect(result.restString).toBe('');
    });

    it('should handle empty event chunk with empty string', () => {
        const eventChunk = '';
        const result = parseSSE(eventChunk);
        expect(result.data).toHaveLength(0);
        expect(result.restString).toBe('');
    });

    it('should handle event chunk with only whitespace', () => {
        const eventChunk = '   \n  \n  ';
        const result = parseSSE(eventChunk);
        expect(result.data).toHaveLength(0);
        expect(result.restString).toBe('   \n  \n  ');
    });

    it('should handle event with malformed field names', () => {
        const eventChunk = 'evt: test-event\ndat: test-data\n\n';
        const result = parseSSE(eventChunk);
        expect(result.data).toHaveLength(1);
        expect(result.data[0]).toEqual({});
        expect(result.restString).toBe('');
    });

    it('should handle event with mixed valid and invalid fields', () => {
        const eventChunk = 'event: test-event\ndat: test-data\nid: 123\n\n';
        const result = parseSSE(eventChunk);
        expect(result.data).toHaveLength(1);
        expect(result.data[0]).toEqual({
            event: 'test-event',
            id: '123'
        });
        expect(result.restString).toBe('');
    });

    it('should handle event with empty field names', () => {
        const eventChunk = ': test-event\n: test-data\n\n';
        const result = parseSSE(eventChunk);
        expect(result.data).toHaveLength(1);
        expect(result.data[0]).toEqual({});
        expect(result.restString).toBe('');
    });

    it('should handle event with special characters in field names', () => {
        const eventChunk = 'event@: test-event\ndata#: test-data\n\n';
        const result = parseSSE(eventChunk);
        expect(result.data).toHaveLength(1);
        expect(result.data[0]).toEqual({});
        expect(result.restString).toBe('');
    });
});
