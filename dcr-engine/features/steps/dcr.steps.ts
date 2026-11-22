import { Given, When, Then } from "quickpickle";
import { expect } from "vitest";
import { execute, isAccepting, isEnabled, executeS, isEnabledS, isAcceptingS } from "../../src/executionEngine";
import type { DCRGraphS, RelationType } from "../../src/types";
import { addRelation, emptyGraph } from "./graph";

type Api = "plain" | "S";
type World = { api: Api; graph: DCRGraphS };

const relationTypes: RelationType[] = ["condition", "response", "include", "exclude", "milestone"];

const enabled = (w: World, e: string): boolean =>
  w.api === "plain" ? isEnabled(e, w.graph) : isEnabledS(e, w.graph, w.graph).enabled;

const accepting = (w: World): boolean =>
  w.api === "plain" ? isAccepting(w.graph) : isAcceptingS(w.graph, w.graph);

Given("the API is {string}", (w: World, api: string) => {
  if (api !== "plain" && api !== "S") throw new Error(`Unknown API "${api}"`);
  w.api = api;
});

Given("a graph with events {string}", (w: World, events: string) => {
  w.graph = emptyGraph(events.split(",").map((e) => e.trim()));
});

Given("{string} is a(n) {word} for {string}", (w: World, from: string, type: string, to: string) => {
  if (!relationTypes.includes(type as RelationType)) throw new Error(`Unknown relation "${type}"`);
  addRelation(w.graph, type as RelationType, from, to);
});

Given("{string} is excluded", (w: World, e: string) => {
  w.graph.marking.included.delete(e);
});

Given("{string} is already pending", (w: World, e: string) => {
  w.graph.marking.pending.set(e, undefined);
});

When("{string} is executed", (w: World, e: string) => {
  if (w.api === "plain") execute(e, w.graph);
  else executeS(e, w.graph);
});

Then("{string} is enabled", (w: World, e: string) => {
  expect(enabled(w, e)).toBe(true);
});

Then("{string} is not enabled", (w: World, e: string) => {
  expect(enabled(w, e)).toBe(false);
});

Then("{string} is pending", (w: World, e: string) => {
  expect(w.graph.marking.pending.has(e)).toBe(true);
});

Then("{string} is not pending", (w: World, e: string) => {
  expect(w.graph.marking.pending.has(e)).toBe(false);
});

Then("the graph is accepting", (w: World) => {
  expect(accepting(w)).toBe(true);
});

Then("the graph is not accepting", (w: World) => {
  expect(accepting(w)).toBe(false);
});
