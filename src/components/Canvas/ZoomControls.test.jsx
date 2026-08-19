import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ZoomControls from './ZoomControls';

const baseProps = {
  scale: 1,
  canZoomIn: true,
  canZoomOut: true,
  zoomIn: () => {},
  zoomOut: () => {},
  resetView: () => {},
};

describe('ZoomControls', () => {
  it('renders the formatted percent for scale={1}', () => {
    render(<ZoomControls {...baseProps} scale={1} />);
    expect(screen.getByRole('button', { name: 'Reset zoom' }).textContent).toContain('100%');
  });

  it('renders the formatted percent for scale={0.75}', () => {
    render(<ZoomControls {...baseProps} scale={0.75} />);
    expect(screen.getByRole('button', { name: 'Reset zoom' }).textContent).toContain('75%');
  });

  it('disables the Zoom out button when canZoomOut is false', () => {
    render(<ZoomControls {...baseProps} canZoomOut={false} />);
    expect(screen.getByRole('button', { name: 'Zoom out' })).toBeDisabled();
  });

  it('disables the Zoom in button when canZoomIn is false', () => {
    render(<ZoomControls {...baseProps} canZoomIn={false} />);
    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeDisabled();
  });

  it('enables both zoom buttons when canZoomOut and canZoomIn are true', () => {
    render(<ZoomControls {...baseProps} canZoomOut canZoomIn />);
    expect(screen.getByRole('button', { name: 'Zoom out' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Zoom in' })).not.toBeDisabled();
  });

  it('calls zoomOut, zoomIn, and resetView exactly once on click', () => {
    const zoomOut = vi.fn();
    const zoomIn = vi.fn();
    const resetView = vi.fn();
    render(<ZoomControls {...baseProps} zoomOut={zoomOut} zoomIn={zoomIn} resetView={resetView} />);

    fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
    expect(zoomOut).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(zoomIn).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Reset zoom' }));
    expect(resetView).toHaveBeenCalledTimes(1);
  });

  it('prevents default on mouseDown so the button does not steal focus', () => {
    render(<ZoomControls {...baseProps} />);
    const button = screen.getByRole('button', { name: 'Zoom out' });
    // fireEvent returns false when the event's preventDefault() was called.
    expect(fireEvent.mouseDown(button)).toBe(false);
  });

  it('shows the Ctrl modifier label in tooltips (jsdom navigator.platform is "")', () => {
    // MODIFIER_LABEL is computed once at module load from navigator.platform,
    // so only the 'Ctrl' branch is exercisable here. Testing the '⌘' (Mac)
    // branch would require vi.resetModules() + redefining navigator.platform
    // + a dynamic import before first module load — disproportionate for one
    // component. This is a deliberate, known gap, not an oversight.
    const { container } = render(<ZoomControls {...baseProps} />);
    expect(container.textContent).toContain('Ctrl');
  });
});
