import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Examples from "./Examples";

// The list in generated_examples.txt at the time of issue #33, with "Prescribe medicine" twice.
const listed = [
  "Arrange meeting",
  "Prescribe medicine",
  "Legal Compliance by Design",
  "Nesting",
  "Pizza delivery process",
  "Prescribe medicine",
  "Subprocess",
  "Tax Calculation",
];
const unique = [...new Set(listed)];

const renderExamples = () =>
  render(
    <Examples
      examplesData={listed}
      setExamplesOpen={vi.fn()}
      openEditorXML={vi.fn()}
      openCustomXML={vi.fn()}
      openDCRXML={vi.fn()}
      setLoading={vi.fn()}
    />,
  );

const shownExamples = () =>
  screen.queryAllByRole("heading", { level: 3 }).map((h) => h.textContent);

describe("Examples search", () => {
  it("shows exactly the unique matches after the query changes several times", async () => {
    const user = userEvent.setup();
    renderExamples();
    const search = screen.getByRole("textbox");

    for (const query of ["subprocesses", "pre", "subprocess", "", "me", "x", "subprocess"]) {
      await user.clear(search);
      if (query) await user.type(search, query);
      const expected = unique.filter((e) => e.toLowerCase().includes(query));
      expect(shownExamples()).toEqual(expected);
    }
  });
});
