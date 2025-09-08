import { describe, it, expect } from "vitest";
import { setLogLevel } from "./logger";

describe("logger", () => {
  it("sets level without throwing", () => {
    setLogLevel("error");
    expect(true).toBe(true);
  });

  it("ignores unknown log level", () => {
    expect(() => setLogLevel("unknown")).not.toThrow();
  });
});