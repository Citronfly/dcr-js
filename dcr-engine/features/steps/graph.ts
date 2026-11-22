import type { DCRGraphS, EventMap, RelationType } from "../../src/types";

const relationMap: Record<RelationType, "conditionsFor" | "responseTo" | "includesTo" | "excludesTo" | "milestonesFor"> = {
  condition: "conditionsFor",
  response: "responseTo",
  include: "includesTo",
  exclude: "excludesTo",
  milestone: "milestonesFor",
};

const emptyMap = (events: string[]): EventMap =>
  Object.fromEntries(events.map((e) => [e, new Set<string>()]));

export function emptyGraph(events: string[]): DCRGraphS {
  return {
    events: new Set(events),
    conditionsFor: emptyMap(events),
    milestonesFor: emptyMap(events),
    responseTo: emptyMap(events),
    includesTo: emptyMap(events),
    excludesTo: emptyMap(events),
    marking: { executed: new Map(), included: new Set(events), pending: new Map() },
    labels: new Set(events),
    labelMap: Object.fromEntries(events.map((e) => [e, e])),
    labelMapInv: Object.fromEntries(events.map((e) => [e, new Set([e])])),
    subProcesses: {},
    subProcessMap: {},
    roles: new Set(),
    roleMap: {},
  };
}

// conditionsFor and milestonesFor are keyed by the target event; the others by the source.
export function addRelation(g: DCRGraphS, type: RelationType, from: string, to: string): void {
  const map = relationMap[type];
  if (map === "conditionsFor" || map === "milestonesFor") {
    g[map][to].add(from);
  } else {
    g[map][from].add(to);
  }
}
