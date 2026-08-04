import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Counter } from '@/components/counter';

describe('Counter', () => {
  it('renders the label and initial count', () => {
    render(<Counter label="Visits" />);

    expect(screen.getByText('Visits')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('0');
  });

  it('increments the count on click', () => {
    render(<Counter label="Visits" />);

    fireEvent.click(screen.getByRole('button', { name: 'Increment' }));

    expect(screen.getByRole('status')).toHaveTextContent('1');
  });
});
