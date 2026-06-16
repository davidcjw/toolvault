import { describe, expect, it } from "vitest";
import {
  slugify,
  toCamelCase,
  toConstantCase,
  toKebabCase,
  toSentenceCase,
  toSnakeCase,
  toTitleCase,
} from "./textcase";

describe("text case transforms", () => {
  const s = "hello world example";
  it("title case", () => expect(toTitleCase(s)).toBe("Hello World Example"));
  it("sentence case", () => expect(toSentenceCase("hELLO World")).toBe("Hello world"));
  it("camelCase", () => expect(toCamelCase(s)).toBe("helloWorldExample"));
  it("snake_case", () => expect(toSnakeCase(s)).toBe("hello_world_example"));
  it("kebab-case", () => expect(toKebabCase(s)).toBe("hello-world-example"));
  it("CONSTANT_CASE", () => expect(toConstantCase(s)).toBe("HELLO_WORLD_EXAMPLE"));

  it("splits existing camelCase input", () => {
    expect(toSnakeCase("getHTTPResponseCode")).toBe("get_http_response_code");
  });
});

describe("slugify", () => {
  it("makes URL-safe slugs", () => {
    expect(slugify("  Hello, World! ")).toBe("hello-world");
    expect(slugify("Crème Brûlée")).toBe("creme-brulee");
  });
});
