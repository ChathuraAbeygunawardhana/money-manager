/**
 * Basic setup test to verify Jest and React Testing Library are working
 */

import { render, screen } from '@testing-library/react';

// Simple test component
function TestComponent() {
  return <div>Hello Test</div>;
}

describe('Test Setup', () => {
  it('should render a simple component', () => {
    render(<TestComponent />);
    expect(screen.getByText('Hello Test')).toBeInTheDocument();
  });

  it('should have Jest globals available', () => {
    expect(typeof describe).toBe('function');
    expect(typeof it).toBe('function');
    expect(typeof expect).toBe('function');
  });
});