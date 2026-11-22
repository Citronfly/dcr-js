# Testing

The project uses npm workspaces (`app`, `dcr-engine`, `modeler`) and Vitest. Install with `npm ci`, using Node 26 (see `.nvmrc`). Node `^22.22.2`, `^24.15` or 26+ also works.

## Commands

| Command | What it does |
|---|---|
| `npm test` | Runs every test once |
| `npm run test:watch` | Re-runs tests on save |
| `npm run coverage` | Runs the tests with coverage; HTML report in `coverage/index.html` |
| `npx vitest run --project engine-unit` | Runs one project (see below) |
| `npm run typecheck` | Type-checks `dcr-engine`, `app` and the Vitest configs |
| `npm run lint` | Lints `app` |

CI (`.github/workflows/ci.yml`) runs typecheck, lint, tests with coverage, and the production build on every pull request.

## Projects: where a test goes

| Project | Files | Environment | Use it for |
|---|---|---|---|
| `engine-unit` | `dcr-engine/src/**/*.test.ts`, next to the code | node | Engine functions: parsers, conformance, guards, time |
| `engine-features` | `dcr-engine/features/*.feature` | node | DCR semantics written as Given/When/Then scenarios |
| `app` | `app/src/**/*.test.{ts,tsx}` | jsdom + Testing Library | React components |
| `modeler` | `modeler/test/spec/**/*.js` | happy-dom | The diagram editor |

Small fixtures for engine tests go in `dcr-engine/test/fixtures/`.

## Writing a DCR scenario

Expected results come from DCR theory (Hildebrandt and Mukkamala 2010), not from running the engine. Write them as a `Scenario Outline`, so every scenario runs against both the plain API (`execute`/`isEnabled`/`isAccepting`) and the S-API the app uses (`executeS`/`isEnabledS`/`isAcceptingS`):

```gherkin
Scenario Outline: A condition blocks its target until it has been executed (<api>)
  Given the API is "<api>"
  And a graph with events "A, B"
  And "A" is a condition for "B"
  Then "B" is not enabled
  When "A" is executed
  Then "B" is enabled

  Examples:
    | api   |
    | plain |
    | S     |
```

Available steps (in `dcr-engine/features/steps/dcr.steps.ts`):
- `Given the API is "plain" | "S"`
- `Given a graph with events "A, B"`
- `Given "A" is a/an condition | response | include | exclude | milestone for "B"`
- `Given "A" is initially excluded`
- `Given "A" is initially pending`
- `When "A" is executed`
- `Then "A" is enabled`, `Then "A" is not enabled`
- `Then "A" is pending`, `Then "A" is not pending`
- `Then "A" is included`, `Then "A" is not included`
- `Then "A" has been executed`
- `Then the graph is accepting`, `Then the graph is not accepting`

Quickpickle ignores the Given/When/Then keyword when matching a step. So setup steps say "initially", and a new step must never read like an assertion: otherwise a `Then` line could change the graph instead of checking it.

Unit tests can build graphs with the same helpers: `emptyGraph(events)` and `addRelation(graph, type, from, to)` from `dcr-engine/features/steps/graph.ts`.

## Rules

- **Known bugs:** don't fix engine behaviour in a test PR. Tag the scenario `@fails`, or use `it.fails` in a unit test, with a comment saying what is wrong. The test turns red once someone fixes the bug, which reminds them to remove the marker.
- **DOM:** files that need a DOM in the engine (the `DOM*StreamParser`s) start with `// @vitest-environment happy-dom`.
- **App component tests:** mock the diagram editor with `vi.mock("modeler")`, because jsdom can't lay out SVG. Mock `fetch` for components that load files (for example `Examples.tsx`).
- **Lint:** the errors that were already in `app` are listed in `app/eslint-suppressions.json`, so only new errors fail `npm run lint`. After fixing suppressed errors, run `npx eslint --prune-suppressions` in `app` and commit the updated file.
- **Coverage only goes up:** `vitest.config.ts` sets a minimum per package. When your tests raise coverage, raise the numbers to the new values rounded down. Never lower them.
- **End-to-end tests** are not set up yet. When they are added, reuse the Playwright that `bench/` already uses.
