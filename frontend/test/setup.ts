import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Vitest globals are off, so Testing Library cannot register its own
// auto-cleanup hook; restore a clean DOM between tests explicitly.
afterEach(cleanup);
