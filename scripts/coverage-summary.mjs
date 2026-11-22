// Writes per-package coverage from coverage/coverage-summary.json as a Markdown
// table to $GITHUB_STEP_SUMMARY (or stdout when run locally).
import { appendFileSync, readFileSync } from "node:fs";
import { relative, sep } from "node:path";

const metrics = ["lines", "statements", "functions", "branches"];
const summary = JSON.parse(
  readFileSync("coverage/coverage-summary.json", "utf8"),
);

const packages = new Map();
for (const [file, data] of Object.entries(summary)) {
  if (file === "total") continue;
  const name = relative(process.cwd(), file).split(sep)[0];
  const totals =
    packages.get(name) ??
    Object.fromEntries(metrics.map((m) => [m, { covered: 0, total: 0 }]));
  for (const m of metrics) {
    totals[m].covered += data[m].covered;
    totals[m].total += data[m].total;
  }
  packages.set(name, totals);
}

const cell = ({ covered, total }) => {
  const pct = total === 0 ? 100 : (covered / total) * 100;
  return `${pct.toFixed(2)}% (${covered}/${total})`;
};

const rows = [
  ...[...packages].sort(([a], [b]) => a.localeCompare(b)),
  ["**total**", summary.total],
];
const table = [
  "### Coverage",
  "",
  `| Package | ${metrics.map((m) => m[0].toUpperCase() + m.slice(1)).join(" | ")} |`,
  `|---|${metrics.map(() => "---:").join("|")}|`,
  ...rows.map(
    ([name, totals]) =>
      `| ${name} | ${metrics.map((m) => cell(totals[m])).join(" | ")} |`,
  ),
  "",
].join("\n");

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, table);
} else {
  process.stdout.write(table);
}
