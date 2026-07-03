// src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock ResizeObserver for Vitest/JSDOM environment
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock);
