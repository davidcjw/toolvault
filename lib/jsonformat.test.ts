import { describe, expect, it } from "vitest";
import { formatJson } from "./jsonformat";

describe("formatJson", () => {
  it("pretty-prints with the given indent", () => {
    const r = formatJson('{"a":1,"b":[2,3]}', 2);
    expect(r).toEqual({ ok: true, output: '{\n  "a": 1,\n  "b": [\n    2,\n    3\n  ]\n}' });
  });

  it("minifies", () => {
    const r = formatJson('{ "a": 1 }', "min");
    expect(r.ok && r.output).toBe('{"a":1}');
  });

  it("reports errors for invalid JSON", () => {
    const r = formatJson("{ bad }");
    expect(r.ok).toBe(false);
  });

  it("treats empty input as empty output", () => {
    expect(formatJson("   ")).toEqual({ ok: true, output: "" });
  });
});
