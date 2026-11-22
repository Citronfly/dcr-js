import { describe, it, expect } from "vitest";
import { alignTrace, graphToGraphPP } from "./align";
import { addRelation, emptyGraph } from "../features/steps/graph";

const graph = () => {
  const g = emptyGraph(["A", "B"]);
  addRelation(g, "condition", "A", "B");
  return graphToGraphPP(g);
};

describe("alignTrace: activities that are not in the model", () => {
  it("skips an unknown activity in the trace", () => {
    expect(alignTrace(["A", "X", "B"], graph())).toEqual({ cost: 1, trace: ["A", "B"] });
  });

  it("skips an unknown activity with pruning enabled", () => {
    const g = graph();
    const alignment = alignTrace(["A", "X", "B"], g, g.labels, undefined, Infinity, true);
    expect(alignment).toEqual({ cost: 1, trace: ["A", "B"] });
  });
});
