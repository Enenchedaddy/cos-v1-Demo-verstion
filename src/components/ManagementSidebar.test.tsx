import type { ComponentProps } from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MANAGEMENT_RAIL_AREAS } from '../navigation/management';
import ManagementSidebar from './ManagementSidebar';

afterEach(cleanup);

const renderSidebar = (overrides: Partial<ComponentProps<typeof ManagementSidebar>> = {}) => {
  const props: ComponentProps<typeof ManagementSidebar> = {
    activeArea: MANAGEMENT_RAIL_AREAS[0], activeChildId: 'functional', mode: 'global',
    onAreaSelect: vi.fn(), onChildSelect: vi.fn(), onBackToMain: vi.fn(), onClose: vi.fn(), ...overrides,
  };
  render(<ManagementSidebar {...props} />);
  return props;
};

describe('Management sidebar parity', () => {
  it('renders all Management areas in their approved order', () => {
    renderSidebar();
    const menu = screen.getByRole('navigation', { name: 'Management areas' });
    expect(within(menu).getAllByRole('button').map((button) => button.textContent)).toEqual([
      'Command Home', 'Performance & Business Units', 'Governance & Audit', 'Strategy & Planning',
      'Organisation & Headcount', 'M&A Acquisitions', 'Alerts & Policies', 'Entity Registry',
    ]);
  }, 15_000);

  it('selects a global area from its complete row', async () => {
    const props = renderSidebar();
    const menu = screen.getByRole('navigation', { name: 'Management areas' });
    await userEvent.click(within(menu).getByRole('button', { name: 'Governance & Audit' }));
    expect(props.onAreaSelect).toHaveBeenCalledWith('governance');
  });

  it('filters only the active submenu and returns to the main menu', async () => {
    const area = MANAGEMENT_RAIL_AREAS[1];
    const props = renderSidebar({ activeArea: area, activeChildId: 'bu', mode: 'contextual' });
    expect(screen.getByRole('button', { name: 'Overview & BU matrix' })).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('button', { name: 'Approval Policy' })).not.toBeInTheDocument();
    await userEvent.type(screen.getByRole('textbox', { name: 'Search this area' }), 'finance');
    expect(screen.getByRole('button', { name: 'Finance & Cash' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Overview & BU matrix' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Back to main menu' }));
    expect(props.onBackToMain).toHaveBeenCalledOnce();
  });
});
