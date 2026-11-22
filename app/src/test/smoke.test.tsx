import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

describe("app test environment", () => {
  it("renders React into jsdom with jest-dom matchers", () => {
    render(<button>Hi</button>);
    expect(screen.getByRole("button", { name: "Hi" })).toBeInTheDocument();
  });
});
