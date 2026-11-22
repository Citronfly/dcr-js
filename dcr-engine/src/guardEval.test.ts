import { describe, it, expect } from "vitest";
import { evaluateGuard, validateGuardSyntax } from "./guardEval";

describe("evaluateGuard", () => {
  it("evaluates a comparison against the variable store", () => {
    expect(evaluateGuard("x > 5", { x: 10 })).toBe(true);
    expect(evaluateGuard("x > 5", { x: 1 })).toBe(false);
  });

  it("treats a missing guard as true", () => {
    expect(evaluateGuard(undefined, {})).toBe(true);
    expect(evaluateGuard("  ", {})).toBe(true);
  });

  // A malformed guard, or one over an unknown variable, silently evaluates to
  // false: a guarded condition is then ignored and a guarded response, include
  // or exclude does nothing. Documented current behaviour, reported as a finding.
  it("evaluates a malformed guard to false without reporting it", () => {
    expect(evaluateGuard("x >", { x: 1 })).toBe(false);
    expect(evaluateGuard("x > > 5", { x: 1 })).toBe(false);
  });

  it("evaluates a guard over an unknown variable to false", () => {
    expect(evaluateGuard("y > 5", { x: 1 })).toBe(false);
  });
});

describe("validateGuardSyntax", () => {
  it("accepts a valid expression", () => {
    expect(validateGuardSyntax("x > 5 and y = \"a\"")).toBeNull();
  });

  it("reports a malformed expression", () => {
    expect(typeof validateGuardSyntax("x >")).toBe("string");
  });

  it("reports unbalanced parentheses", () => {
    expect(validateGuardSyntax("(x > 5")).toBe("Missing closing parenthesis");
  });
});
