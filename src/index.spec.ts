import { describe, expect, it } from "vitest";
import { parseSSE } from "./index";

describe("parseSSE", () => {
  it("should parse single event correctly", () => {
    const eventChunk = "event: test-event\ndata: test-data\n\n";
    const result = parseSSE(eventChunk);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toEqual({
      event: "test-event",
      data: "test-data",
    });
    expect(result.restString).toBe("");
  });

  it("should parse multiple events correctly", () => {
    const eventChunk = "event: event1\ndata: data1\n\nevent: event2\ndata: data2\n\n";
    const result = parseSSE(eventChunk);
    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toEqual({
      event: "event1",
      data: "data1",
    });
    expect(result.data[1]).toEqual({
      event: "event2",
      data: "data2",
    });
    expect(result.restString).toBe("");
  });

  it("should handle incomplete event in restString", () => {
    const eventChunk = "event: test-event\ndata: test-data\n\nevent: incomplete";
    const result = parseSSE(eventChunk);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toEqual({
      event: "test-event",
      data: "test-data",
    });
    expect(result.restString).toBe("event: incomplete");
  });

  it("should handle empty event chunk", () => {
    const result = parseSSE("");
    expect(result.data).toHaveLength(0);
    expect(result.restString).toBe("");
  });

  it("should handle event chunk with only restString", () => {
    const eventChunk = "event: incomplete";
    const result = parseSSE(eventChunk);
    expect(result.data).toHaveLength(0);
    expect(result.restString).toBe("event: incomplete");
  });

  it("should handle multiple line data fields", () => {
    const eventChunk = "event: test-event\ndata: line1\ndata: line2\n\n";
    const result = parseSSE(eventChunk);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toEqual({
      event: "test-event",
      data: "line1\nline2",
    });
    expect(result.restString).toBe("");
  });

  it("should handle complex event with all fields", () => {
    const eventChunk = "event: test-event\ndata: test-data\nid: 123\nretry: 5000\n\n";
    const result = parseSSE(eventChunk);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toEqual({
      event: "test-event",
      data: "test-data",
      id: "123",
      retry: 5000,
    });
    expect(result.restString).toBe("");
  });

  it("should handle event chunk with only whitespace", () => {
    const eventChunk = "   \n  \n  ";
    const result = parseSSE(eventChunk);
    expect(result.data).toHaveLength(0);
    expect(result.restString).toBe("   \n  \n  ");
  });

  it("should drop events made entirely of unknown fields (no data)", () => {
    const eventChunk = "evt: test-event\ndat: test-data\n\n";
    const result = parseSSE(eventChunk);
    expect(result.data).toHaveLength(0);
    expect(result.restString).toBe("");
  });

  it("should drop events that have no data field even if other fields are set", () => {
    const eventChunk = "event: test-event\nid: 123\n\n";
    const result = parseSSE(eventChunk);
    expect(result.data).toHaveLength(0);
    expect(result.restString).toBe("");
  });

  it("should treat lines starting with colon as comments", () => {
    const eventChunk = ": heartbeat\n: keep-alive\ndata: hi\n\n";
    const result = parseSSE(eventChunk);
    expect(result.data).toEqual([{ data: "hi" }]);
    expect(result.restString).toBe("");
  });

  it("should parse events separated by CRLF line terminators", () => {
    const eventChunk = "event: test-event\r\ndata: test-data\r\n\r\n";
    const result = parseSSE(eventChunk);
    expect(result.data).toEqual([{ event: "test-event", data: "test-data" }]);
    expect(result.restString).toBe("");
  });

  it("should parse events separated by lone CR line terminators", () => {
    const eventChunk = "event: test-event\rdata: test-data\r\r";
    const result = parseSSE(eventChunk);
    expect(result.data).toEqual([{ event: "test-event", data: "test-data" }]);
    expect(result.restString).toBe("");
  });

  it("should hold a trailing lone CR in restString so CRLF pairs aren't split", () => {
    const first = parseSSE("data: a\r");
    expect(first.data).toHaveLength(0);
    expect(first.restString).toBe("data: a\r");

    const second = parseSSE(`${first.restString}\ndata: b\n\n`);
    expect(second.data).toEqual([{ data: "a\nb" }]);
    expect(second.restString).toBe("");
  });

  it("should strip a leading BOM from the stream", () => {
    const eventChunk = "﻿data: hello\n\n";
    const result = parseSSE(eventChunk);
    expect(result.data).toEqual([{ data: "hello" }]);
    expect(result.restString).toBe("");
  });

  it("should ignore retry values that aren't strictly digits", () => {
    const eventChunk = "retry: 5s\ndata: x\n\n";
    const result = parseSSE(eventChunk);
    expect(result.data).toEqual([{ data: "x" }]);
  });
});
