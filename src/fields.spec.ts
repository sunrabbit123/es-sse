import { describe, expect, it } from "vitest";
import { parseSSEFields } from "./fields";

describe("parseSSEFields", () => {
  it("should parse event field correctly", () => {
    const fields = ["event: test-event", "data: x"];
    const result = parseSSEFields(fields);
    expect(result?.event).toBe("test-event");
  });

  it("should parse data field correctly", () => {
    const fields = ["data: test-data"];
    const result = parseSSEFields(fields);
    expect(result?.data).toBe("test-data");
  });

  it("should handle data field containing \":\" characters", () => {
    const fields = ["data: this is a data: field"];
    const result = parseSSEFields(fields);
    expect(result?.data).toBe("this is a data: field");
  });

  it("should split on the first colon only (no required trailing space)", () => {
    const fields = ["data:no-space"];
    const result = parseSSEFields(fields);
    expect(result?.data).toBe("no-space");
  });

  it("should strip only a single leading space from the value", () => {
    const fields = ["data:  two-leading-spaces"];
    const result = parseSSEFields(fields);
    expect(result?.data).toBe(" two-leading-spaces");
  });

  it("should treat a line without a colon as a field name with empty value", () => {
    const fields = ["data"];
    const result = parseSSEFields(fields);
    expect(result?.data).toBe("");
  });

  it("should concatenate multiple data fields with newline", () => {
    const fields = ["data: first-line", "data: second-line"];
    const result = parseSSEFields(fields);
    expect(result?.data).toBe("first-line\nsecond-line");
  });

  it("should handle multiple data fields containing colons", () => {
    const fields = ["data: first data: line", "data: second data: line"];
    const result = parseSSEFields(fields);
    expect(result?.data).toBe("first data: line\nsecond data: line");
  });

  it("should parse id field correctly", () => {
    const fields = ["id: 123", "data: x"];
    const result = parseSSEFields(fields);
    expect(result?.id).toBe("123");
  });

  it("should reject id values containing NULL", () => {
    const fields = [`id: bad${String.fromCharCode(0)}id`, "data: x"];
    const result = parseSSEFields(fields);
    expect(result?.id).toBeUndefined();
  });

  it("should parse retry field as number", () => {
    const fields = ["retry: 5000", "data: x"];
    const result = parseSSEFields(fields);
    expect(result?.retry).toBe(5000);
  });

  it("should ignore retry values that are not only ASCII digits", () => {
    const fields = ["retry: 5000ms", "data: x"];
    const result = parseSSEFields(fields);
    expect(result?.retry).toBeUndefined();
  });

  it("should ignore lines that start with a colon (comments)", () => {
    const fields = [": keep-alive", "data: x"];
    const result = parseSSEFields(fields);
    expect(result?.data).toBe("x");
  });

  it("should handle multiple fields correctly", () => {
    const fields = [
      "event: test-event",
      "data: test-data",
      "id: 123",
      "retry: 5000",
    ];
    const result = parseSSEFields(fields);
    expect(result).toEqual({
      event: "test-event",
      data: "test-data",
      id: "123",
      retry: 5000,
    });
  });

  it("should ignore unknown fields", () => {
    const fields = ["unknown: value", "event: test-event", "data: x"];
    const result = parseSSEFields(fields);
    expect(result?.event).toBe("test-event");
    expect(result).not.toHaveProperty("unknown");
  });

  it("should not dispatch an event when no data field is present", () => {
    expect(parseSSEFields([])).toBeNull();
    expect(parseSSEFields(["event: x"])).toBeNull();
    expect(parseSSEFields(["id: 1", "retry: 1000"])).toBeNull();
  });

  it("should preserve an empty data field as an empty string", () => {
    const fields = ["data:"];
    const result = parseSSEFields(fields);
    expect(result).toEqual({ data: "" });
  });
});
