import { describe, expect, it } from 'vitest';
import {
  allowedTransitions,
  assertCan,
  assertManualPublish,
  assertSchedule,
  assertTransition,
  can,
  hasCurrentApproval,
  invalidateAffectedApprovals,
  nextVersionNumber,
  searchState,
} from './domain';
import { briefInputSchema, ideaInputSchema } from './model';
import { createSeedState } from './seed';

describe('Content & Social governance', () => {
  it('enforces the role permission matrix', () => {
    expect(can('CS_MANAGER', 'approval.decide')).toBe(true);
    expect(can('EXECUTIVE_VIEWER', 'content.edit')).toBe(false);
    expect(() => assertCan('EXECUTIVE_VIEWER', 'content.edit')).toThrow(/cannot perform/i);
  });

  it('permits only declared lifecycle transitions', () => {
    const state = createSeedState();
    const item = state.contentItems.find((record) => record.lifecycleState === 'INTERNAL_REVIEW')!;
    expect(allowedTransitions(item, state)).toContain('CLIENT_APPROVAL');
    expect(() => assertTransition(item, 'PUBLISHED', state)).toThrow(/does not permit/i);
  });

  it('recognises approval only for the current immutable version', () => {
    const state = createSeedState();
    const approval = state.approvals.find((record) => record.status === 'APPROVED')!;
    const approved = state.contentItems.find((record) => record.id === approval.contentItemId)!;
    expect(hasCurrentApproval(approved, state)).toBe(true);
    expect(hasCurrentApproval({ ...approved, currentVersionId: '99000000-0000-4000-8000-000000000099' }, state)).toBe(false);
  });

  it('marks prior approvals stale when an affected variant receives a new version', () => {
    const state = createSeedState();
    const approval = state.approvals.find((record) => record.status === 'APPROVED')!;
    const variantId = approval.targets[0].variantId;
    const changed = invalidateAffectedApprovals([approval], variantId, '99000000-0000-4000-8000-000000000002');
    expect(changed[0].status).toBe('STALE');
    expect(changed[0].revision).toBe(approval.revision + 1);
  });

  it('increments versions within a platform variant', () => {
    const state = createSeedState();
    const variant = state.variants[0];
    expect(nextVersionNumber(variant, state.versions)).toBe(3);
  });

  it('blocks scheduling a stale version', () => {
    const state = createSeedState();
    const approval = state.approvals.find((record) => record.status === 'APPROVED')!;
    const item = state.contentItems.find((record) => record.id === approval.contentItemId)!;
    const variant = state.variants.find((record) => record.contentItemId === item.id)!;
    expect(() => assertSchedule(item, { ...variant, currentVersionId: '99000000-0000-4000-8000-000000000003' }, { plannedAt: '2026-08-20T10:00', timezone: 'Europe/London' }, state)).toThrow(/current immutable version/i);
  });

  it('requires proof before manual publication', () => {
    const state = createSeedState();
    const approval = state.approvals.find((record) => record.status === 'APPROVED')!;
    const item = state.contentItems.find((record) => record.id === approval.contentItemId)!;
    expect(() => assertManualPublish(item, item.currentVersionId!, { externalUrl: '', publishedAt: new Date().toISOString(), proofNote: '' }, state)).toThrow(/live URL/i);
  });

  it('finds scoped records without throwing on heterogeneous data', () => {
    const results = searchState(createSeedState(), 'linkedin');
    expect(results.length).toBeGreaterThan(0);
  });
});

describe('Content & Social validation', () => {
  it('rejects an incomplete idea', () => {
    expect(ideaInputSchema.safeParse({ title: '', summary: '', source: '', owner: '', priority: 'MEDIUM' }).success).toBe(false);
  });

  it('requires a complete production brief', () => {
    const result = briefInputSchema.safeParse({ title: 'Launch', objective: '', audience: '', keyMessage: '', callToAction: '', owner: 'Aisha', dueDate: '', channels: [], formats: [] });
    expect(result.success).toBe(false);
  });
});
