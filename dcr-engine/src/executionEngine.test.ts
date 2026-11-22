import { describe, it, expect } from "vitest";
import { executeS, isEnabledS, isAcceptingS } from "./executionEngine";
import type { DCRGraphS, SubProcess } from "./types";
import { addRelation, emptyGraph } from "../features/steps/graph";

function withSubProcess(g: DCRGraphS, id: string, members: string[]): SubProcess {
  const sp: SubProcess = { id, parent: g, events: new Set(members) };
  g.subProcesses[id] = sp;
  for (const m of members) g.subProcessMap[m] = sp;
  return sp;
}

describe("executeS / isEnabledS: subprocesses", () => {
  it("does not enable an event whose subprocess is excluded", () => {
    const g = emptyGraph(["P", "X"]);
    const P = withSubProcess(g, "P", ["X"]);
    g.marking.included.delete("P");
    expect(isEnabledS("X", g, P).enabled).toBe(false);
  });

  it("executes the subprocess itself once it becomes accepting", () => {
    const g = emptyGraph(["P", "X", "Z"]);
    withSubProcess(g, "P", ["X"]);
    addRelation(g, "response", "P", "Z");
    executeS("X", g);
    expect(g.marking.executed.has("P")).toBe(true);
    expect(g.marking.pending.has("Z")).toBe(true);
  });

  it("does not execute the subprocess while one of its events is pending", () => {
    const g = emptyGraph(["P", "X", "Y"]);
    withSubProcess(g, "P", ["X", "Y"]);
    addRelation(g, "response", "X", "Y");
    executeS("X", g);
    expect(g.marking.executed.has("P")).toBe(false);
    expect(isAcceptingS(g.subProcesses.P, g)).toBe(false);
  });
});

describe("executeS / isEnabledS: guards", () => {
  const guarded = () => {
    const g = emptyGraph(["A", "B"]);
    addRelation(g, "condition", "A", "B");
    g.guardMap = { A: { B: { condition: "x > 5" } } };
    return g;
  };

  it("ignores a condition whose guard is false", () => {
    expect(isEnabledS("B", guarded(), guarded(), { x: 1 }).enabled).toBe(true);
  });

  it("applies a condition whose guard is true", () => {
    const g = guarded();
    expect(isEnabledS("B", g, g, { x: 10 }).enabled).toBe(false);
  });

  it("only applies a guarded response when its guard holds", () => {
    const g = emptyGraph(["A", "B"]);
    addRelation(g, "response", "A", "B");
    g.guardMap = { A: { B: { response: "x > 5" } } };
    executeS("A", g, { x: 1 });
    expect(g.marking.pending.has("B")).toBe(false);
    executeS("A", g, { x: 10 });
    expect(g.marking.pending.has("B")).toBe(true);
  });
});

describe("executeS / isEnabledS: time", () => {
  const t0 = new Date("2026-01-05T09:00:00.000Z");
  const at = (ms: number) => new Date(t0.getTime() + ms);

  it("keeps a delayed condition blocking until the delay has passed", () => {
    const g = emptyGraph(["A", "B"]);
    addRelation(g, "condition", "A", "B");
    g.timeConstraintMap = { A: { B: { delay: 1000 } } };
    executeS("A", g, {}, t0);
    expect(isEnabledS("B", g, g, {}, at(500)).enabled).toBe(false);
    expect(isEnabledS("B", g, g, {}, at(1000)).enabled).toBe(true);
  });

  it("sets a response deadline relative to the execution time", () => {
    const g = emptyGraph(["A", "B"]);
    addRelation(g, "response", "A", "B");
    g.timeConstraintMap = { A: { B: { deadline: 2000 } } };
    executeS("A", g, {}, t0);
    expect(g.marking.pending.get("B")?.getTime()).toBe(t0.getTime() + 2000);
  });

  it("makes the response pending without a deadline when no time is given", () => {
    const g = emptyGraph(["A", "B"]);
    addRelation(g, "response", "A", "B");
    g.timeConstraintMap = { A: { B: { deadline: 2000 } } };
    executeS("A", g);
    expect(g.marking.pending.has("B")).toBe(true);
    expect(g.marking.pending.get("B")).toBeUndefined();
  });
});
