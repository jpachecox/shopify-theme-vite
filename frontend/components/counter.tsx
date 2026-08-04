import { useState } from 'react';
import type { JSX } from 'react';

type CounterProps = {
  label: string;
};

/**
 * Sample component validating the Vitest + Testing Library harness.
 * Replace with real design-system components.
 */
export function Counter({ label }: CounterProps): JSX.Element {
  const [count, setCount] = useState(0);

  return (
    <div>
      <span>{label}</span>
      <output>{count}</output>
      <button type="button" onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
