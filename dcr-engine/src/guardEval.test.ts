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

  // Known issue: a malformed guard is evaluated on its longest valid prefix and
  // the rest is ignored, so it silently comes out true or false. Nothing
  // reports it, and the catch block in evaluateGuard is unreachable.
  it("evaluates a malformed guard on its valid prefix without reporting it", () => {
    expect(evaluateGuard("x 5", { x: 1 })).toBe(true);
    expect(evaluateGuard("x >", { x: 1 })).toBe(false);
    expect(evaluateGuard("x > 5 junk", { x: 10 })).toBe(true);
  });

  it("evaluates a guard over an unknown variable without reporting it", () => {
    expect(evaluateGuard("y > 5", { x: 1 })).toBe(false);
    expect(evaluateGuard("not y > 5", { x: 1 })).toBe(true);
  });

  it.each(["constructor", "toString", "hasOwnProperty"])(
    "treats %s, which exists only on Object.prototype, as an unknown variable",
    (name) => {
      expect(evaluateGuard(name, {})).toBe(evaluateGuard("y", {}));
      expect(evaluateGuard(name, {})).toBe(false);
      expect(evaluateGuard(`not ${name}`, {})).toBe(true);
      expect(evaluateGuard(`${name} > 5`, {})).toBe(false);
    },
  );

  it("still reads a variable that is an own property of the store", () => {
    expect(evaluateGuard("count > 5", { count: 10 })).toBe(true);
    expect(evaluateGuard("count", { count: true })).toBe(true);
    expect(evaluateGuard("constructor", { constructor: true })).toBe(true);
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
