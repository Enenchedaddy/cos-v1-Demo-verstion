import type {
  ContentApproval,
  ContentItem,
  ContentSocialState,
  ContentVersion,
  LifecycleState,
  ModuleAuditEvent,
  ModuleRole,
  PlatformVariant,
  PublishInput,
  ScheduleInput,
} from './model';

export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export const TRANSITIONS: Record<LifecycleState, readonly LifecycleState[]> = {
  IDEA: ['BRIEF', 'CANCELLED'],
  BRIEF: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PRODUCTION', 'CANCELLED'],
  IN_PRODUCTION: ['INTERNAL_REVIEW', 'CANCELLED'],
  INTERNAL_REVIEW: ['IN_PRODUCTION', 'CLIENT_APPROVAL', 'SCHEDULED', 'CANCELLED'],
  CLIENT_APPROVAL: ['IN_PRODUCTION', 'SCHEDULED', 'CANCELLED'],
  SCHEDULED: ['INTERNAL_REVIEW', 'PUBLISHED', 'CANCELLED'],
  PUBLISHED: ['PERFORMANCE_REVIEW'],
  PERFORMANCE_REVIEW: ['ARCHIVED'],
  ARCHIVED: [],
  CANCELLED: [],
};

const ROLE_PERMISSIONS: Record<ModuleRole, readonly string[]> = {
  CS_MANAGER: ['*'],
  MODULE_ADMIN: ['settings.manage', 'audit.view', 'connection.manage', 'content.view'],
  PLANNER: ['content.view', 'idea.manage', 'brief.manage', 'content.create', 'content.transition', 'approval.request'],
  CONTRIBUTOR: ['content.view', 'content.edit', 'version.create', 'content.transition', 'asset.view'],
  SOCIAL_COMMUNITY: ['content.view', 'schedule.manage', 'publish.confirm', 'community.manage', 'listening.manage', 'approval.view'],
  PERFORMANCE_ANALYST: ['content.view', 'metric.manage', 'performance.view', 'performance.export'],
  ACCOUNT_BRAND: ['content.view', 'approval.request', 'approval.view', 'brief.manage'],
  EXECUTIVE_VIEWER: ['content.view', 'performance.view', 'audit.view'],
  CLIENT_APPROVER: ['approval.view', 'approval.decide'],
};

export function can(role: ModuleRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] ?? [];
  return permissions.includes('*') || permissions.includes(permission);
}

export function assertCan(role: ModuleRole, permission: string): void {
  if (!can(role, permission)) {
    throw new DomainError('Your current role cannot perform this action.', 'FORBIDDEN');
  }
}

export function allowedTransitions(item: ContentItem, state: ContentSocialState): LifecycleState[] {
  return TRANSITIONS[item.lifecycleState].filter((target) => {
    if (target === 'SCHEDULED') {
      if (!item.currentVersionId) return false;
      return hasCurrentApproval(item, state) || item.lifecycleState === 'INTERNAL_REVIEW';
    }
    if (target === 'PUBLISHED') {
      return state.publishRecords.some(
        (record) => record.contentItemId === item.id && record.status === 'PUBLISHED' && record.versionId === item.currentVersionId,
      );
    }
    if (target === 'PERFORMANCE_REVIEW') {
      return state.metrics.some((metric) => metric.contentItemId === item.id);
    }
    return true;
  });
}

export function assertTransition(item: ContentItem, target: LifecycleState, state: ContentSocialState): void {
  if (!TRANSITIONS[item.lifecycleState].includes(target)) {
    throw new DomainError(`The workflow does not permit ${item.lifecycleState} -> ${target}.`, 'INVALID_TRANSITION');
  }
  if (!allowedTransitions(item, state).includes(target)) {
    if (target === 'SCHEDULED') {
      throw new DomainError('Scheduling requires a current immutable version and the configured approval.', 'MISSING_APPROVAL');
    }
    if (target === 'PUBLISHED') {
      throw new DomainError('Published requires valid manual proof or a successful connector result.', 'MISSING_PUBLISH_PROOF');
    }
    if (target === 'PERFORMANCE_REVIEW') {
      throw new DomainError('Performance review requires at least one sourced metric.', 'MISSING_METRICS');
    }
  }
}

export function hasCurrentApproval(item: ContentItem, state: ContentSocialState): boolean {
  if (!item.currentVersionId) return false;
  return state.approvals.some(
    (approval) =>
      approval.contentItemId === item.id &&
      approval.status === 'APPROVED' &&
      approval.targets.some((target) => target.versionId === item.currentVersionId),
  );
}

export function nextVersionNumber(variant: PlatformVariant, versions: ContentVersion[]): number {
  const numbers = versions
    .filter((version) => version.variantId === variant.id)
    .map((version) => version.versionNumber);
  return (numbers.length ? Math.max(...numbers) : 0) + 1;
}

export function invalidateAffectedApprovals(
  approvals: ContentApproval[],
  variantId: string,
  newVersionId: string,
): ContentApproval[] {
  return approvals.map((approval) => {
    const targetsVariant = approval.targets.some((target) => target.variantId === variantId);
    const alreadyTargetsNewVersion = approval.targets.some((target) => target.versionId === newVersionId);
    if (!targetsVariant || alreadyTargetsNewVersion || !['PENDING', 'APPROVED'].includes(approval.status)) return approval;
    return {
      ...approval,
      status: 'STALE',
      updatedAt: new Date().toISOString(),
      revision: approval.revision + 1,
    };
  });
}

export function assertSchedule(
  item: ContentItem,
  variant: PlatformVariant | undefined,
  input: ScheduleInput,
  state: ContentSocialState,
): void {
  if (!variant || variant.contentItemId !== item.id) {
    throw new DomainError('Choose a valid platform variant for this content item.', 'INVALID_VARIANT');
  }
  if (!variant.currentVersionId || variant.currentVersionId !== item.currentVersionId) {
    throw new DomainError('Only the current immutable version can be scheduled.', 'STALE_VERSION');
  }
  if (!hasCurrentApproval(item, state) && item.lifecycleState !== 'INTERNAL_REVIEW') {
    throw new DomainError('The current version does not have a valid approval.', 'MISSING_APPROVAL');
  }
  if (Number.isNaN(Date.parse(input.plannedAt))) {
    throw new DomainError('Choose a valid planned publication time.', 'INVALID_DATE');
  }
}

export function assertManualPublish(
  item: ContentItem,
  versionId: string,
  input: PublishInput,
  state: ContentSocialState,
): void {
  if (item.currentVersionId !== versionId) {
    throw new DomainError('Publication proof must reference the current immutable version.', 'STALE_VERSION');
  }
  if (!hasCurrentApproval(item, state)) {
    throw new DomainError('The current version is not approved for publication.', 'MISSING_APPROVAL');
  }
  if (!input.externalUrl || !input.proofNote) {
    throw new DomainError('A live URL and evidence note are required before marking Published.', 'MISSING_PUBLISH_PROOF');
  }
}

export function createAuditEvent(input: {
  workspaceId: string;
  clientId: string;
  brandId: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  targetVersion?: string | null;
  summary: string;
  result?: 'SUCCESS' | 'FAILURE' | 'REVERSAL';
}): ModuleAuditEvent {
  return {
    id: crypto.randomUUID(),
    occurredAt: new Date().toISOString(),
    actorType: 'USER',
    requestId: crypto.randomUUID(),
    result: input.result ?? 'SUCCESS',
    ...input,
  };
}

export function searchState(state: ContentSocialState, query: string): Array<{ id: string; kind: string; title: string; detail: string }> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  const includes = (...values: Array<string | number | null | undefined>) => values.join(' ').toLowerCase().includes(normalized);
  return [
    ...state.ideas.filter((item) => includes(item.title, item.summary, item.owner)).map((item) => ({ id: item.id, kind: 'Idea', title: item.title, detail: item.status })),
    ...state.briefs.filter((item) => includes(item.title, item.briefNumber, item.owner, item.status)).map((item) => ({ id: item.id, kind: 'Brief', title: item.title, detail: `${item.briefNumber} · ${item.status}` })),
    ...state.contentItems.filter((item) => includes(item.title, item.contentNumber, item.owner, item.lifecycleState, item.tags.join(' '))).map((item) => ({ id: item.id, kind: 'Content', title: item.title, detail: `${item.contentNumber} · ${item.lifecycleState}` })),
    ...state.assets.filter((item) => includes(item.name, item.assetNumber, item.owner, item.rightsStatus)).map((item) => ({ id: item.id, kind: 'Asset', title: item.name, detail: `${item.sourceProvider} · ${item.rightsStatus}` })),
    ...state.communityRecords.filter((item) => includes(item.contactName, item.summary, item.classification, item.owner)).map((item) => ({ id: item.id, kind: 'Community', title: item.contactName, detail: `${item.classification} · ${item.status}` })),
    ...state.listeningSignals.filter((item) => includes(item.topic, item.summary, item.channel, item.owner)).map((item) => ({ id: item.id, kind: 'Signal', title: item.topic, detail: `${item.channel} · ${item.severity}` })),
  ].slice(0, 24);
}

export function formatLifecycle(value: string): string {
  return value.toLowerCase().split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}
