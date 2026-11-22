import { describe, it, expect } from "vitest";
import { parseDurationMs } from "./utility";

describe("parseDurationMs", () => {
  it("parses an ISO 8601 day duration", () => {
    expect(parseDurationMs("P1D")).toBe(86_400_000);
  });

  it("adds date and time parts", () => {
    expect(parseDurationMs("P1DT2H3M4S")).toBe(86_400_000 + 2 * 3_600_000 + 3 * 60_000 + 4_000);
  });
});
