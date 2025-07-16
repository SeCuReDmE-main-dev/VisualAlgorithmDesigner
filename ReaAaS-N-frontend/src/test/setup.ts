// src/test/setup.ts
import '@testing-library/jest-dom';

// Mock ResizeObserver for Vitest/JSDOM environment
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', ResizeObserverMock);
