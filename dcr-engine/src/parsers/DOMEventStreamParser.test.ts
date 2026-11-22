// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DOMEventStreamParser } from "./DOMEventStreamParser";
import { parseRoleLog } from "../eventLogs";

const fixture = readFileSync(join(import.meta.dirname, "../../test/fixtures/small.xes"), "utf8");

describe("DOMEventStreamParser.parseAsRoleLog", () => {
  it("reads the same activities and trace lengths as parseRoleLog", async () => {
    const streamed = await DOMEventStreamParser.parseAsRoleLog(new File([fixture], "small.xes"));
    const reference = parseRoleLog(fixture);
    expect(streamed.events).toEqual(reference.events);
    expect(Object.fromEntries(Object.entries(streamed.traces).map(([id, t]) => [id, t.map((e) => [e.activity, e.role])])))
      .toEqual(Object.fromEntries(Object.entries(reference.traces).map(([id, t]) => [id, t.map((e) => [e.activity, e.role])])));
  });
});
