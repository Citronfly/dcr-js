import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseRoleLog, writeEventLog } from "./eventLogs";
import type { EventLog, RoleTrace } from "./types";

const fixture = readFileSync(join(import.meta.dirname, "../test/fixtures/small.xes"), "utf8");

const roundTrip = (log: EventLog<RoleTrace>) => parseRoleLog(writeEventLog(log));

const logOf = (traces: Record<string, string[]>): EventLog<RoleTrace> => ({
  events: new Set(Object.values(traces).flat()),
  traces: Object.fromEntries(
    Object.entries(traces).map(([id, acts]) => [id, acts.map((activity) => ({ activity, role: "R" }))]),
  ),
});

describe("parseRoleLog", () => {
  it("reads activities, roles, trace ids and timestamps from XES", () => {
    const log = parseRoleLog(fixture);
    expect(log.events).toEqual(new Set(["Register", "Examine", "Prescribe"]));
    expect(Object.keys(log.traces)).toEqual(["case-1", "case-2"]);
    expect(log.traces["case-1"].map((e) => e.activity)).toEqual(["Register", "Examine", "Prescribe"]);
    expect(log.traces["case-1"].map((e) => e.role)).toEqual(["Nurse", "Doctor", "Doctor"]);
    expect(log.traces["case-1"][0].timestamp?.toISOString()).toBe("2026-01-05T09:00:00.000Z");
    expect(log.traces["case-2"]).toHaveLength(2);
  });
});

describe("writeEventLog then parseRoleLog", () => {
  it("keeps traces, roles and timestamps", () => {
    const ts = new Date("2026-01-05T09:00:00.000Z");
    const log: EventLog<RoleTrace> = {
      events: new Set(["A", "B"]),
      traces: {
        t1: [{ activity: "A", role: "Nurse", timestamp: ts }, { activity: "B", role: "Doctor" }],
        t2: [{ activity: "B", role: "Doctor" }],
      },
    };
    const back = roundTrip(log);
    expect(back.events).toEqual(log.events);
    expect(back.traces.t1.map((e) => [e.activity, e.role])).toEqual([["A", "Nurse"], ["B", "Doctor"]]);
    expect(back.traces.t1[0].timestamp?.getTime()).toBe(ts.getTime());
    expect(back.traces.t2.map((e) => e.activity)).toEqual(["B"]);
  });

  it("keeps XML special characters and non-ASCII letters in activity names", () => {
    const names = ["A & B", "<x>", "Æble", "say \"hi\""];
    expect(roundTrip(logOf({ t1: names })).traces.t1.map((e) => e.activity)).toEqual(names);
  });

  // Passes only because parseLogGenerator joins classifier values into a string;
  // trace ids and roles get no such conversion (see the tests below).
  it("keeps simple numeric and boolean-looking activity names", () => {
    expect(roundTrip(logOf({ t1: ["1", "true"] })).traces.t1.map((e) => e.activity)).toEqual(["1", "true"]);
  });

  // Known bug: parserOptions.parseAttributeValue turns "2.50" into 2.5 and "007" into 7.
  it.fails("keeps numeric-looking activity names exactly as written", () => {
    expect(roundTrip(logOf({ t1: ["2.50", "007"] })).traces.t1.map((e) => e.activity)).toEqual(["2.50", "007"]);
  });

  // Known bug: parseAttributeValue turns case id "01" into 1, so traces "1" and "01" merge.
  it.fails("keeps zero-padded case ids as separate traces", () => {
    const back = roundTrip(logOf({ "1": ["A"], "01": ["B"] }));
    expect(Object.keys(back.traces).sort()).toEqual(["01", "1"]);
  });

  // Known bug: parseAttributeValue turns role "007" into the number 7.
  it.fails("keeps numeric-looking roles as strings", () => {
    const log: EventLog<RoleTrace> = { events: new Set(["A"]), traces: { t1: [{ activity: "A", role: "007" }] } };
    expect(roundTrip(log).traces.t1[0].role).toBe("007");
  });

  // Known bug: trimValues strips surrounding whitespace from activity names.
  it.fails("keeps surrounding whitespace in activity names", () => {
    expect(roundTrip(logOf({ t1: [" A "] })).traces.t1[0].activity).toBe(" A ");
  });

  // Known bug: parseRoleLog only creates a trace when it reads an event, so empty traces vanish.
  it.fails("keeps a trace that has no events", () => {
    expect(Object.keys(roundTrip(logOf({ t1: ["A"], empty: [] })).traces)).toEqual(["t1", "empty"]);
  });
});
