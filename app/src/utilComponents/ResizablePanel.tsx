import { useRef, useState } from "react";
import styled from "styled-components";

const MIN_WIDTH = 280;

const Panel = styled.div<{ $left: string }>`
  position: fixed;
  top: 0;
  left: ${(props) => props.$left};
  height: 100vh;
  max-width: 25rem;
  display: flex;
  box-shadow: 0px 0 5px 0px grey;
  z-index: 4;
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const Handle = styled.div`
  flex-shrink: 0;
  width: 6px;
  cursor: col-resize;
  touch-action: none;
  background-color: darkgrey;
  &:hover {
    background-color: grey;
  }
`;

interface ResizablePanelProps {
  left: string;
  className?: string;
  children: React.ReactNode;
}

export const ResizablePanel = ({
  left,
  className,
  children,
}: ResizablePanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>();

  const startResize = (e: React.PointerEvent) => {
    if (!panelRef.current) return;
    document.body.style.userSelect = "none";
    const rect = panelRef.current.getBoundingClientRect();
    const startX = e.clientX;
    const maxWidth = window.innerWidth - rect.left;
    const onMove = (ev: PointerEvent) => {
      setWidth(Math.min(maxWidth, Math.max(MIN_WIDTH, rect.width + ev.clientX - startX)));
    };
    const onUp = () => {
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  return (
    <Panel
      ref={panelRef}
      $left={left}
      style={width === undefined ? undefined : { width, maxWidth: "none" }}
    >
      <Content className={className}>{children}</Content>
      <Handle
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize trace view"
        onPointerDown={startResize}
      />
    </Panel>
  );
};
