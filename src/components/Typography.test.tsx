import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageTitleBar, SectionTitleBar } from './Typography';

describe('COS typography primitives', () => {
  it('preserves one semantic page heading and supporting hierarchy', () => {
    render(<PageTitleBar eyebrow="Content operations" title="Production pipeline" subtitle="Governed work" actions={<button>New content</button>} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Production pipeline' })).toHaveClass('cos-type-page-title');
    expect(screen.getByText('Content operations')).toHaveClass('cos-type-eyebrow');
    expect(screen.getByRole('button', { name: 'New content' })).toBeVisible();
  });

  it('uses an h2 for reusable card and section headers', () => {
    render(<SectionTitleBar title="Approval queue" detail="Exact-version decisions" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Approval queue' })).toHaveClass('cos-type-card-title');
  });
});
