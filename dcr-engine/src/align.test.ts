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

describe("alignTrace: when skipping the whole trace is the best alignment", () => {
  it("aligns an empty trace on an accepting graph at no cost", () => {
    expect(alignTrace([], graph())).toEqual({ cost: 0, trace: [] });
  });

  it("aligns a trace made only of unknown activities", () => {
    expect(alignTrace(["X", "Y"], graph())).toEqual({ cost: 2, trace: [] });
  });

  it("skips an activity that can never be executed", () => {
    const g = emptyGraph(["A", "B"]);
    g.marking.included.delete("B");
    expect(alignTrace(["B"], graphToGraphPP(g))).toEqual({ cost: 1, trace: [] });
  });
});
