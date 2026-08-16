import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Home } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { ContextRailHeader, GlobalRailBrand } from './DualRailNavigation';

describe('COS dual-rail branding', () => {
  it('renders the shared contextual hierarchy for the active area', () => {
    render(<ContextRailHeader area={{ id: 'home', label: 'Home', icon: Home }} />);

    expect(screen.getByText('Central Operating System')).toBeVisible();
    expect(screen.getByText('Home')).toHaveClass('uppercase', 'font-display');
    expect(screen.getByTestId('cos-context-rail-header')).toHaveClass('h-[90px]');
  });

  it('uses a compact, wrapping scale for long authoritative area names', () => {
    const { container, rerender } = render(<ContextRailHeader area={{ id: 'content', label: 'Content & Social', icon: Home }} />);
    expect(container.querySelector('[data-testid="cos-context-rail-title"]')).toHaveClass('text-lg', 'whitespace-nowrap');

    rerender(<ContextRailHeader area={{ id: 'lifecycle', label: 'Lifecycle & Customer Growth', icon: Home }} />);
    expect(container.querySelector('[data-testid="cos-context-rail-title"]')).toHaveClass('text-sm', 'whitespace-normal');
    expect(container.querySelector('[data-testid="cos-context-rail-title"]')).not.toHaveClass('truncate');
  });

  it('keeps the brand tile keyboard-accessible and functional', async () => {
    const onActivate = vi.fn();
    const user = userEvent.setup();
    render(<GlobalRailBrand onActivate={onActivate} />);

    await user.click(screen.getByRole('button', { name: 'Open COS home' }));
    expect(onActivate).toHaveBeenCalledOnce();
    expect(screen.getByTestId('cos-rail-brand')).toBeVisible();
  });
});
