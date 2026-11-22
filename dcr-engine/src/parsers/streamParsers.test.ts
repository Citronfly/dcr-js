// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import type { EventLog, RoleTrace } from "../types";
import { writeEventLog } from "../eventLogs";
import { StringTraceStreamParser } from "./StringTraceStreamParser";
import { StringEventStreamParser } from "./StringEventStreamParser";
import { RegexTraceStreamParser } from "./RegexTraceStreamParser";
import { RegexEventStreamParser } from "./RegexEventStreamParser";
import { DOMTraceStreamParser } from "./DOMTraceStreamParser";
import { DOMEventStreamParser } from "./DOMEventStreamParser";
import { SAXParser } from "./SAXParser";

// All seven run under happy-dom: the DOM parsers need DOMParser, and the app runs them in a browser anyway.
const parsers = {
  StringTraceStreamParser,
  StringEventStreamParser,
  RegexTraceStreamParser,
  RegexEventStreamParser,
  DOMTraceStreamParser,
  DOMEventStreamParser,
  SAXParser,
};

type ParserName = keyof typeof parsers;

type Case = {
  name: string;
  xes: string;
  check: (log: EventLog<RoleTrace>) => void;
  // Parsers where the case is a known bug, with the reason. Those run as it.fails.
  knownBugs?: Partial<Record<ParserName, string>>;
};

const allParsers = (reason: string) =>
  Object.fromEntries(Object.keys(parsers).map((name) => [name, reason])) as Record<ParserName, string>;

const oneEvent = (activity: string, extra: Partial<RoleTrace[number]> = {}): EventLog<RoleTrace> => ({
  events: new Set([activity]),
  traces: { t1: [{ activity, role: "R", ...extra }] },
});

const activityCase = (activity: string): Case => ({
  name: `keeps the activity name ${JSON.stringify(activity)}`,
  xes: writeEventLog(oneEvent(activity)),
  check: (log) => {
    expect(log.traces.t1.map((e) => e.activity)).toEqual([activity]);
    expect([...log.events]).toEqual([activity]);
  },
});

const timestamp = new Date("2026-01-05T09:30:15.250Z");

const cases: Case[] = [
  ...["2.50", "007", " A ", "A & B", "<x>", "Æble"].map(activityCase),
  {
    name: 'keeps case ids "1" and "01" as separate traces',
    xes: writeEventLog({
      events: new Set(["A", "B"]),
      traces: { "1": [{ activity: "A", role: "R" }], "01": [{ activity: "B", role: "R" }] },
    }),
    check: (log) => {
      expect(Object.keys(log.traces).sort()).toEqual(["01", "1"]);
      expect(log.traces["1"].map((e) => e.activity)).toEqual(["A"]);
      expect(log.traces["01"].map((e) => e.activity)).toEqual(["B"]);
    },
  },
  {
    name: 'keeps the role "007" as a string',
    xes: writeEventLog(oneEvent("A", { role: "007" })),
    check: (log) => {
      expect(log.traces.t1[0].role).toBe("007");
    },
  },
  {
    name: "keeps the timestamp",
    xes: writeEventLog(oneEvent("A", { timestamp })),
    check: (log) => {
      expect(log.traces.t1[0].timestamp?.getTime()).toBe(timestamp.getTime());
    },
  },
  {
    name: "keeps the decimal variable value 2.5",
    xes: writeEventLog(oneEvent("A", { varName: "x", value: 2.5 })),
    check: (log) => {
      expect(log.traces.t1[0].varName).toBe("x");
      expect(log.traces.t1[0].value).toBe(2.5);
    },
    knownBugs: allParsers("writeEventLog writes 2.5 as <int>, and parseAttribute reads <int> with parseInt, giving 2"),
  },
  {
    name: "keeps an empty trace",
    xes: writeEventLog({
      events: new Set(["A"]),
      traces: { t1: [{ activity: "A", role: "R" }], empty: [] },
    }),
    check: (log) => {
      expect(Object.keys(log.traces).sort()).toEqual(["empty", "t1"]);
      expect(log.traces.empty).toEqual([]);
    },
    knownBugs: allParsers("traces are only created from events, so a trace without events is dropped"),
  },
  {
    name: "reads a trace without concept:name as one trace",
    // Written by hand: writeEventLog always names its traces.
    xes: `<?xml version="1.0" encoding="UTF-8"?>
<log xes.version="1.0">
  <trace>
    <event>
      <string key="concept:name" value="A"/>
      <string key="role" value="R"/>
    </event>
    <event>
      <string key="concept:name" value="B"/>
      <string key="role" value="R"/>
    </event>
  </trace>
</log>
`,
    check: (log) => {
      expect(Object.values(log.traces).map((t) => t.map((e) => e.activity))).toEqual([["A", "B"]]);
    },
    knownBugs: allParsers("getTraceId generates a new id for every event, so each event becomes its own trace"),
  },
];

describe.each(Object.entries(parsers))("%s.parseAsRoleLog round-trips writeEventLog", (name, parser) => {
  for (const c of cases) {
    const knownBug = c.knownBugs?.[name as ParserName];
    const test = knownBug ? it.fails : it;
    test(knownBug ? `${c.name} (known bug: ${knownBug})` : c.name, async () => {
      c.check(await parser.parseAsRoleLog(new File([c.xes], "log.xes")));
    });
  }
});
