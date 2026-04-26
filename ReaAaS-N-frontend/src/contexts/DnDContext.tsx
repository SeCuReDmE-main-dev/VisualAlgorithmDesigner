import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

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
  setDrag: (type: string, payload: DragPayload) => void;
  clearDrag: () => void;
}

const DnDContext = createContext<DnDContextValue | null>(null);

export function DnDProvider({ children }: { children: ReactNode }) {
  const [dragType, setDragType] = useState<string | null>(null);
  const [dragPayload, setDragPayload] = useState<DragPayload | null>(null);

  const value = useMemo<DnDContextValue>(
    () => ({
      dragType,
      dragPayload,
      setDrag: (type, payload) => {
        setDragType(type);
        setDragPayload(payload);
      },
      clearDrag: () => {
        setDragType(null);
        setDragPayload(null);
      },
    }),
    [dragPayload, dragType],
  );

  return <DnDContext.Provider value={value}>{children}</DnDContext.Provider>;
}

export function useDnD() {
  const context = useContext(DnDContext);

  if (!context) {
    throw new Error('useDnD must be used within DnDProvider');
  }

  return context;
}
