import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Home } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { ContextRailHeader, ExpandedSidebarNavigation, GlobalRailBrand } from './DualRailNavigation';

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

  it('drills into one submenu level and returns with Back', async () => {
    const onParentSelect = vi.fn();
    const onChildSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <ExpandedSidebarNavigation
        items={[{ id: 'creators', label: 'Creators & Partnerships', icon: Home, children: [{ id: 'prospects', label: 'Prospects' }] }, { id: 'home', label: 'Home', icon: Home }]}
        activeParentId="creators"
        activeChildId="prospects"
        ariaLabel="Workspace navigation"
        onParentSelect={onParentSelect}
        onChildSelect={onChildSelect}
      />,
    );

    expect(screen.getByRole('button', { name: 'Home' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Creators & Partnerships' }));
    expect(screen.getByTestId('cos-drill-title')).toHaveTextContent('Creators & Partnerships');
    expect(screen.queryByRole('button', { name: 'Home' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Prospects' })).toHaveAttribute('aria-current', 'page');
    await user.click(screen.getByRole('button', { name: 'Back to Main Menu' }));
    expect(screen.getByRole('button', { name: 'Home' })).toBeVisible();
    expect(onParentSelect).toHaveBeenCalledWith('creators');
    expect(onChildSelect).not.toHaveBeenCalled();
  });

  it('supports a nested drill-in level with parent-specific Back labels', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ExpandedSidebarNavigation
        items={[{ id: 'creators', label: 'Creators & Partnerships', icon: Home, children: [{ id: 'prospects', label: 'Prospects', icon: Home, children: [{ id: 'qualification', label: 'Qualification' }] }] }]}
        activeParentId="creators"
        ariaLabel="Workspace navigation"
        onParentSelect={vi.fn()}
        onChildSelect={vi.fn()}
      />,
    );

    await user.click(container.querySelector('.cos-expanded-navigation__parent')!);
    await user.click(container.querySelector('.cos-expanded-navigation__parent')!);
    expect(screen.getByTestId('cos-drill-title')).toHaveTextContent('Prospects');
    expect(screen.getByRole('button', { name: 'Back to Creators & Partnerships' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Back to Creators & Partnerships' }));
    expect(screen.getByTestId('cos-drill-title')).toHaveTextContent('Creators & Partnerships');
  });
});
