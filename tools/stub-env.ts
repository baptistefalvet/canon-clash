// Minimal browser globals so the simulation can run under Node.
const g = globalThis as unknown as Record<string, unknown>;
g.window = { location: { search: '' }, addEventListener() {} };
g.performance = g.performance ?? { now: () => Date.now() };
