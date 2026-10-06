import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import CardInteractionManager from './CardInteractionManager';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
it('registers new cards without remeasuring existing page content', async () => {
  const measure = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect');
  const view = render(<><CardInteractionManager /><article data-testid="existing">Existing card</article></>);
  await waitFor(() => expect(view.getByTestId('existing')).toHaveAttribute('data-card-surface'));
  measure.mockClear();
  view.rerender(<><CardInteractionManager /><article data-testid="existing">Existing card</article><article data-testid="added">New card</article></>);
  await waitFor(() => expect(view.getByTestId('added')).toHaveAttribute('data-card-surface'));
  expect(measure.mock.instances).not.toContain(view.getByTestId('existing'));
  act(() => view.unmount());
});
