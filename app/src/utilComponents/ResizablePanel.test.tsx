import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ResizablePanel } from "./ResizablePanel";

const renderPanel = () => {
  render(
    <ResizablePanel left="0rem">
      <p>content</p>
    </ResizablePanel>,
  );
  const handle = screen.getByRole("separator", { name: "Resize trace view" });
  const panel = handle.parentElement as HTMLElement;
  vi.spyOn(panel, "getBoundingClientRect").mockReturnValue(
    DOMRect.fromRect({ x: 100, y: 0, width: 300, height: 800 }),
  );
  return { handle, panel };
};

const drag = (handle: HTMLElement, fromX: number, toX: number) => {
  fireEvent.pointerDown(handle, { clientX: fromX });
  fireEvent.pointerMove(window, { clientX: toX });
  fireEvent.pointerUp(window, { clientX: toX });
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ResizablePanel", () => {
  it("keeps its content-based width until it is dragged", () => {
    const { panel } = renderPanel();
    expect(panel.style.width).toBe("");
  });

  it("follows the drag distance from its current width", () => {
    const { handle, panel } = renderPanel();
    drag(handle, 400, 450);
    expect(panel.style.width).toBe("350px");
    drag(handle, 400, 390);
    expect(panel.style.width).toBe("290px");
  });

  it("does not shrink below the minimum width", () => {
    const { handle, panel } = renderPanel();
    drag(handle, 400, 0);
    expect(panel.style.width).toBe("280px");
  });

  it("does not grow past the right edge of the window", () => {
    const { handle, panel } = renderPanel();
    drag(handle, 400, 5000);
    expect(panel.style.width).toBe(`${window.innerWidth - 100}px`);
  });

  it("stops resizing when the pointer is released", () => {
    const { handle, panel } = renderPanel();
    drag(handle, 400, 450);
    fireEvent.pointerMove(window, { clientX: 600 });
    expect(panel.style.width).toBe("350px");
  });
});
