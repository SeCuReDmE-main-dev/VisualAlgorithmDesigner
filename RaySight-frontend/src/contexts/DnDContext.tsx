import { CSSProperties, createContext, ReactNode, useContext, useMemo, useState } from 'react';

export interface SubpipelineNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface SubpipelineEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}

export interface DragPayload {
  algorithmId: string;
  label: string;
  category: string;
  isPrefab?: boolean;
  prefabNodes?: SubpipelineNode[];
  prefabEdges?: SubpipelineEdge[];
  isValidated?: boolean;
  coherenceScore?: number;
  loopCapable?: boolean;
}

interface DnDContextValue {
  dragType: string | null;
  dragPayload: DragPayload | null;
  pointerPosition: { x: number; y: number } | null;
  isPointerDragging: boolean;
  setDrag: (type: string, payload: DragPayload) => void;
  startPointerDrag: (type: string, payload: DragPayload, position: { x: number; y: number }) => void;
  movePointerDrag: (position: { x: number; y: number }) => void;
  clearDrag: () => void;
}

const DnDContext = createContext<DnDContextValue | null>(null);

export function DnDProvider({ children }: { children: ReactNode }) {
  const [dragType, setDragType] = useState<string | null>(null);
  const [dragPayload, setDragPayload] = useState<DragPayload | null>(null);
  const [pointerPosition, setPointerPosition] = useState<{ x: number; y: number } | null>(null);
  const [isPointerDragging, setIsPointerDragging] = useState(false);

  const value = useMemo<DnDContextValue>(
    () => ({
      dragType,
      dragPayload,
      pointerPosition,
      isPointerDragging,
      setDrag: (type, payload) => {
        setDragType(type);
        setDragPayload(payload);
      },
      startPointerDrag: (type, payload, position) => {
        setDragType(type);
        setDragPayload(payload);
        setPointerPosition(position);
        setIsPointerDragging(true);
      },
      movePointerDrag: (position) => {
        setPointerPosition(position);
      },
      clearDrag: () => {
        setDragType(null);
        setDragPayload(null);
        setPointerPosition(null);
        setIsPointerDragging(false);
      },
    }),
    [dragPayload, dragType, isPointerDragging, pointerPosition],
  );

  return (
    <DnDContext.Provider value={value}>
      {children}
      {dragPayload && pointerPosition && isPointerDragging && (
        <div
          className="vad-drag-preview"
          style={
            {
              '--vad-drag-x': `${pointerPosition.x}px`,
              '--vad-drag-y': `${pointerPosition.y}px`,
            } as CSSProperties
          }
        >
          <span className="vad-drag-preview__handle" aria-hidden="true">
            ⋮⋮
          </span>
          <span className="vad-drag-preview__label">{dragPayload.label}</span>
          <span className="vad-drag-preview__category">{dragPayload.category}</span>
        </div>
      )}
    </DnDContext.Provider>
  );
}

export function useDnD() {
  const context = useContext(DnDContext);

  if (!context) {
    throw new Error('useDnD must be used within DnDProvider');
  }

  return context;
}
