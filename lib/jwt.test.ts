import { describe, expect, it } from "vitest";
import { decodeJwt, jwtTimestamp } from "./jwt";

// Standard jwt.io sample token (HS256).
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
  ".eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ" +
  ".SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

describe("decodeJwt", () => {
  it("decodes header and payload", () => {
    const { header, payload, signature } = decodeJwt(TOKEN);
    expect(header).toEqual({ alg: "HS256", typ: "JWT" });
    expect(payload.name).toBe("John Doe");
    expect(payload.sub).toBe("1234567890");
    expect(signature).toBe("SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");
  });

  it("rejects malformed tokens", () => {
    expect(() => decodeJwt("not.a")).toThrow();
  });
});

describe("jwtTimestamp", () => {
  it("converts seconds to ISO", () => {
    expect(jwtTimestamp(1516239022)).toBe("2018-01-18T01:30:22.000Z");
    expect(jwtTimestamp("nope")).toBeNull();
  });
});
