import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AnimatePresence } from 'motion/react';
import { FloatingLayer, useContentFade } from './SurfaceMotion';

afterEach(cleanup);

it('retains a closing dialog for its exit and removes it afterwards', async () => {
  const dialog = (open: boolean) => <AnimatePresence>{open && <FloatingLayer role="dialog"><form className="bg-white"><input aria-label="Name" /></form></FloatingLayer>}</AnimatePresence>;
  const view = render(dialog(true));
  view.rerender(dialog(false));
  expect(screen.getByRole('dialog', { hidden: true })).toHaveAttribute('data-closing', 'true');
  await waitFor(() => expect(screen.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument());
});

it('preserves field state when a section fade runs', () => {
  const animate = vi.fn(() => ({ cancel: vi.fn() }));
  function Page({ section }: { section: string }) {
    const ref = useContentFade(section);
    return <div ref={ref}><input aria-label="Draft" defaultValue="" /></div>;
  }
  const view = render(<Page section="one" />);
  const input = screen.getByRole('textbox');
  Object.defineProperty(input.parentElement, 'animate', { value: animate, configurable: true });
  fireEvent.change(input, { target: { value: 'Keep this draft' } });
  view.rerender(<Page section="two" />);
  expect(screen.getByRole('textbox')).toBe(input);
  expect(input).toHaveValue('Keep this draft');
  expect(animate).toHaveBeenCalledOnce();
});
