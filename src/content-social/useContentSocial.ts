import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  assetInputSchema,
  briefInputSchema,
  communityInputSchema,
  ideaInputSchema,
  listeningInputSchema,
  metricInputSchema,
  publishInputSchema,
  scheduleInputSchema,
  versionInputSchema,
  type AssetInput,
  type BriefInput,
  type CommunityInput,
  type ContentApproval,
  type ContentBrief,
  type ContentIdea,
  type ContentItem,
  type ContentSocialSession,
  type ContentSocialState,
  type IdeaInput,
  type LifecycleState,
  type ListeningInput,
  type MetricInput,
  type PublishInput,
  type ScheduleInput,
  type ScopeContext,
  type VersionInput,
} from './model';
import {
  assertCan,
  assertManualPublish,
  assertSchedule,
  assertTransition,
  createAuditEvent,
  invalidateAffectedApprovals,
  nextVersionNumber,
} from './domain';
import { ContentSocialRepository, RepositoryError, type ContentSocialCollection } from './repository';
import { DEMO_SESSION } from './seed';

type LoadStatus = 'loading' | 'loaded' | 'error' | 'restricted';

const emptyState: ContentSocialState = {
  ideas: [], briefs: [], contentItems: [], variants: [], versions: [], approvals: [], schedules: [],
  publishRecords: [], assets: [], communityRecords: [], listeningSignals: [], metrics: [], notifications: [], auditEvents: [],
};

const isoNow = () => new Date().toISOString();

export function useContentSocial(scope: ScopeContext) {
  const repository = useMemo(() => new ContentSocialRepository(scope), [scope]);
  const [state, setState] = useState<ContentSocialState>(emptyState);
  const stateRef = useRef(state);
  const [session, setSession] = useState<ContentSocialSession | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [warning, setWarning] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [mutating, setMutating] = useState(false);

  const applyState = useCallback((next: ContentSocialState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const reload = useCallback(async () => {
    setStatus('loading');
    setError(undefined);
    try {
      const result = await repository.load();
      applyState(result.state);
      setSession(result.session);
      setWarning(result.warning);
      setStatus('loaded');
    } catch (loadError) {
      setStatus(loadError instanceof RepositoryError && loadError.code === 'RESTRICTED' ? 'restricted' : 'error');
      setError(loadError instanceof Error ? loadError.message : 'Content & Social could not be loaded.');
    }
  }, [applyState, repository]);

  useEffect(() => { void reload(); }, [reload]);

  const commit = useCallback(async (next: ContentSocialState, changed: ContentSocialCollection[]) => {
    setMutating(true);
    setError(undefined);
    try {
      await repository.persist(next, [...new Set(changed)]);
      applyState(next);
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : 'The change could not be saved.');
      throw mutationError;
    } finally {
      setMutating(false);
    }
  }, [applyState, repository]);

  const audit = useCallback((action: string, targetType: string, targetId: string, summary: string, targetVersion?: string | null) => {
    if (!session) throw new Error('No active Content & Social session.');
    return createAuditEvent({ ...scope, actorId: session.userId, actorName: session.displayName, action, targetType, targetId, targetVersion, summary });
  }, [scope, session]);

  const recordBase = useCallback((id = crypto.randomUUID()) => {
    if (!session) throw new Error('No active Content & Social session.');
    return {
      id,
      workspaceId: scope.workspaceId,
      clientId: scope.clientId,
      brandId: scope.brandId,
      createdAt: isoNow(),
      createdBy: session.userId,
      updatedAt: isoNow(),
      updatedBy: session.userId,
      revision: 1,
    };
  }, [scope, session]);

  const createIdea = useCallback(async (raw: IdeaInput) => {
    if (!session) return;
    assertCan(session.role, 'idea.manage');
    const input = ideaInputSchema.parse(raw);
    const idea: ContentIdea = { ...recordBase(), ...input, status: 'OPEN' };
    const event = audit('idea.created', 'ContentIdea', idea.id, `Created idea “${idea.title}”.`);
    const current = stateRef.current;
    await commit({ ...current, ideas: [idea, ...current.ideas], auditEvents: [event, ...current.auditEvents] }, ['ideas', 'auditEvents']);
    return idea;
  }, [audit, commit, recordBase, session]);

  const convertIdea = useCallback(async (ideaId: string) => {
    if (!session) return;
    assertCan(session.role, 'brief.manage');
    const current = stateRef.current;
    const idea = current.ideas.find((item) => item.id === ideaId);
    if (!idea) throw new Error('Idea not found.');
    const briefId = crypto.randomUUID();
    const brief: ContentBrief = {
      ...recordBase(briefId),
      briefNumber: `BRF-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${String(current.briefs.length + 1).padStart(3, '0')}`,
      title: idea.title,
      objective: idea.summary,
      audience: '', keyMessage: '', callToAction: '', channels: [], formats: [],
      owner: idea.owner,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      status: 'DRAFT', sourceIdeaId: idea.id,
    };
    const ideas = current.ideas.map((item) => item.id === ideaId ? { ...item, status: 'CONVERTED' as const, convertedBriefId: briefId, updatedAt: isoNow(), updatedBy: session.userId, revision: item.revision + 1 } : item);
    const event = audit('idea.converted', 'ContentIdea', idea.id, `Converted idea to ${brief.briefNumber}.`);
    await commit({ ...current, ideas, briefs: [brief, ...current.briefs], auditEvents: [event, ...current.auditEvents] }, ['ideas', 'briefs', 'auditEvents']);
    return brief;
  }, [audit, commit, recordBase, session]);

  const createBrief = useCallback(async (raw: BriefInput) => {
    if (!session) return;
    assertCan(session.role, 'brief.manage');
    const input = briefInputSchema.parse(raw);
    const current = stateRef.current;
    const brief: ContentBrief = {
      ...recordBase(), ...input,
      channels: input.channels as ContentBrief['channels'],
      formats: input.formats as ContentBrief['formats'],
      briefNumber: `BRF-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${String(current.briefs.length + 1).padStart(3, '0')}`,
      status: 'DRAFT',
    };
    const event = audit('brief.created', 'ContentBrief', brief.id, `Created ${brief.briefNumber}.`);
    await commit({ ...current, briefs: [brief, ...current.briefs], auditEvents: [event, ...current.auditEvents] }, ['briefs', 'auditEvents']);
    return brief;
  }, [audit, commit, recordBase, session]);

  const setBriefStatus = useCallback(async (briefId: string, nextStatus: ContentBrief['status']) => {
    if (!session) return;
    assertCan(session.role, 'brief.manage');
    const current = stateRef.current;
    const brief = current.briefs.find((item) => item.id === briefId);
    if (!brief) throw new Error('Brief not found.');
    if (nextStatus === 'SUBMITTED') briefInputSchema.parse(brief);
    const briefs = current.briefs.map((item) => item.id === briefId ? { ...item, status: nextStatus, updatedAt: isoNow(), updatedBy: session.userId, revision: item.revision + 1 } : item);
    const event = audit(`brief.${nextStatus.toLowerCase()}`, 'ContentBrief', briefId, `${brief.briefNumber} moved to ${nextStatus}.`);
    await commit({ ...current, briefs, auditEvents: [event, ...current.auditEvents] }, ['briefs', 'auditEvents']);
  }, [audit, commit, session]);

  const createContentFromBrief = useCallback(async (briefId: string) => {
    if (!session) return;
    assertCan(session.role, 'content.create');
    const current = stateRef.current;
    const brief = current.briefs.find((item) => item.id === briefId);
    if (!brief) throw new Error('Brief not found.');
    if (brief.status !== 'APPROVED') throw new Error('Approve the brief before creating production work.');
    const itemId = crypto.randomUUID();
    const variantId = crypto.randomUUID();
    const item: ContentItem = {
      ...recordBase(itemId),
      contentNumber: `CNT-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${String(current.contentItems.length + 1).padStart(3, '0')}`,
      title: brief.title,
      briefId,
      owner: brief.owner,
      lifecycleState: 'ASSIGNED',
      priority: 'MEDIUM',
      dueDate: brief.dueDate,
      primaryChannel: brief.channels[0] ?? 'LinkedIn',
      format: brief.formats[0] ?? 'Static',
      exceptions: [], tags: [],
    };
    const variant = {
      ...recordBase(variantId), contentItemId: itemId, channel: item.primaryChannel, format: item.format,
      title: `${item.primaryChannel} variant`, copy: brief.keyMessage, callToAction: brief.callToAction,
    };
    const event = audit('content.created', 'ContentItem', item.id, `Created ${item.contentNumber} from ${brief.briefNumber}.`);
    await commit({ ...current, contentItems: [item, ...current.contentItems], variants: [variant, ...current.variants], auditEvents: [event, ...current.auditEvents] }, ['contentItems', 'variants', 'auditEvents']);
    return item;
  }, [audit, commit, recordBase, session]);

  const transitionContent = useCallback(async (itemId: string, target: LifecycleState) => {
    if (!session) return;
    assertCan(session.role, 'content.transition');
    const current = stateRef.current;
    const item = current.contentItems.find((record) => record.id === itemId);
    if (!item) throw new Error('Content item not found.');
    assertTransition(item, target, current);
    const contentItems = current.contentItems.map((record) => record.id === itemId ? { ...record, lifecycleState: target, updatedAt: isoNow(), updatedBy: session.userId, revision: record.revision + 1 } : record);
    const event = audit('content.transitioned', 'ContentItem', itemId, `${item.contentNumber}: ${item.lifecycleState} -> ${target}.`, item.currentVersionId);
    await commit({ ...current, contentItems, auditEvents: [event, ...current.auditEvents] }, ['contentItems', 'auditEvents']);
  }, [audit, commit, session]);

  const createVersion = useCallback(async (itemId: string, raw: VersionInput) => {
    if (!session) return;
    assertCan(session.role, 'version.create');
    const input = versionInputSchema.parse(raw);
    const current = stateRef.current;
    const item = current.contentItems.find((record) => record.id === itemId);
    const variant = current.variants.find((record) => record.contentItemId === itemId);
    if (!item || !variant) throw new Error('Content item or variant not found.');
    const versionId = crypto.randomUUID();
    const version = {
      ...recordBase(versionId), contentItemId: itemId, variantId: variant.id,
      versionNumber: nextVersionNumber(variant, current.versions), copy: input.copy,
      changeSummary: input.changeSummary, externalAssetUrl: input.externalAssetUrl || null,
      submittedAt: isoNow(), immutable: true as const,
    };
    const variants = current.variants.map((record) => record.id === variant.id ? { ...record, copy: input.copy, currentVersionId: versionId, updatedAt: isoNow(), updatedBy: session.userId, revision: record.revision + 1 } : record);
    const contentItems = current.contentItems.map((record) => record.id === itemId ? { ...record, currentVersionId: versionId, updatedAt: isoNow(), updatedBy: session.userId, revision: record.revision + 1 } : record);
    const approvals = invalidateAffectedApprovals(current.approvals, variant.id, versionId);
    const event = audit('version.created', 'ContentVersion', versionId, `Created immutable v${version.versionNumber}; affected approvals were marked stale.`, versionId);
    await commit({ ...current, contentItems, variants, versions: [version, ...current.versions], approvals, auditEvents: [event, ...current.auditEvents] }, ['contentItems', 'variants', 'versions', 'approvals', 'auditEvents']);
    return version;
  }, [audit, commit, recordBase, session]);

  const requestApproval = useCallback(async (itemId: string) => {
    if (!session) return;
    assertCan(session.role, 'approval.request');
    const current = stateRef.current;
    const item = current.contentItems.find((record) => record.id === itemId);
    const variant = current.variants.find((record) => record.contentItemId === itemId && record.currentVersionId === item?.currentVersionId);
    const version = current.versions.find((record) => record.id === item?.currentVersionId);
    if (!item || !variant || !version) throw new Error('Submit an immutable version before requesting approval.');
    const approval: ContentApproval = {
      ...recordBase(),
      approvalNumber: `APR-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${String(current.approvals.length + 1).padStart(3, '0')}`,
      contentItemId: item.id, title: item.title, routeName: 'DELabs standard client approval', stepName: 'Client decision',
      status: 'PENDING', targets: [{ variantId: variant.id, versionId: version.id, channel: variant.channel, versionNumber: version.versionNumber }],
      requestedBy: session.displayName, requestedAt: isoNow(), dueAt: new Date(Date.now() + 2 * 86400000).toISOString(), clientVisible: true,
      secureTokenExpiresAt: new Date(Date.now() + 7 * 86400000).toISOString(), decisions: [],
    };
    const contentItems = current.contentItems.map((record) => record.id === itemId ? { ...record, lifecycleState: 'CLIENT_APPROVAL' as const, updatedAt: isoNow(), updatedBy: session.userId, revision: record.revision + 1 } : record);
    const event = audit('approval.requested', 'ContentApproval', approval.id, `Requested approval for exact ${variant.channel} v${version.versionNumber}.`, version.id);
    await commit({ ...current, contentItems, approvals: [approval, ...current.approvals], auditEvents: [event, ...current.auditEvents] }, ['contentItems', 'approvals', 'auditEvents']);
    return approval;
  }, [audit, commit, recordBase, session]);

  const decideApproval = useCallback(async (approvalId: string, action: 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED', comment: string) => {
    if (!session) return;
    assertCan(session.role, 'approval.decide');
    const current = stateRef.current;
    const approval = current.approvals.find((item) => item.id === approvalId);
    if (!approval || approval.status !== 'PENDING') throw new Error('Only a pending current approval can be decided.');
    const stale = approval.targets.some((target) => current.variants.find((variant) => variant.id === target.variantId)?.currentVersionId !== target.versionId);
    if (stale) throw new Error('This approval is stale because a targeted variant has a newer version.');
    const decision = { id: crypto.randomUUID(), action, actorId: session.userId, actorName: session.displayName, comment: comment.trim(), decidedAt: isoNow() };
    const approvals = current.approvals.map((item) => item.id === approvalId ? { ...item, status: action, decisions: [...item.decisions, decision], updatedAt: isoNow(), updatedBy: session.userId, revision: item.revision + 1 } : item);
    const contentItems = current.contentItems.map((item) => item.id === approval.contentItemId ? { ...item, exceptions: action === 'CHANGES_REQUESTED' ? [...item.exceptions, { flag: 'NEEDS_CHANGES' as const, reason: comment || 'Changes requested during approval.', owner: item.owner, openedAt: isoNow(), openedBy: session.userId }] : item.exceptions, updatedAt: isoNow(), updatedBy: session.userId, revision: item.revision + 1 } : item);
    const event = audit(`approval.${action.toLowerCase()}`, 'ContentApproval', approvalId, `${session.displayName} recorded ${action} for ${approval.approvalNumber}.`, approval.targets.map((target) => target.versionId).join(','));
    await commit({ ...current, approvals, contentItems, auditEvents: [event, ...current.auditEvents] }, ['approvals', 'contentItems', 'auditEvents']);
  }, [audit, commit, session]);

  const scheduleContent = useCallback(async (itemId: string, raw: ScheduleInput) => {
    if (!session) return;
    assertCan(session.role, 'schedule.manage');
    const input = scheduleInputSchema.parse(raw);
    const current = stateRef.current;
    const item = current.contentItems.find((record) => record.id === itemId);
    const variant = current.variants.find((record) => record.contentItemId === itemId && record.currentVersionId === item?.currentVersionId);
    if (!item) throw new Error('Content item not found.');
    assertSchedule(item, variant, input, current);
    const schedule = { ...recordBase(), contentItemId: item.id, variantId: variant!.id, versionId: variant!.currentVersionId!, channel: variant!.channel, plannedAt: new Date(input.plannedAt).toISOString(), timezone: input.timezone, publishMethod: 'MANUAL' as const, status: 'READY' as const };
    const contentItems = current.contentItems.map((record) => record.id === itemId ? { ...record, lifecycleState: 'SCHEDULED' as const, updatedAt: isoNow(), updatedBy: session.userId, revision: record.revision + 1 } : record);
    const event = audit('schedule.created', 'ContentSchedule', schedule.id, `Scheduled ${item.contentNumber} for ${schedule.channel}; publication remains manual.`, schedule.versionId);
    await commit({ ...current, schedules: [schedule, ...current.schedules], contentItems, auditEvents: [event, ...current.auditEvents] }, ['schedules', 'contentItems', 'auditEvents']);
    return schedule;
  }, [audit, commit, recordBase, session]);

  const confirmManualPublish = useCallback(async (scheduleId: string, raw: PublishInput) => {
    if (!session) return;
    assertCan(session.role, 'publish.confirm');
    const input = publishInputSchema.parse(raw);
    const current = stateRef.current;
    const schedule = current.schedules.find((record) => record.id === scheduleId);
    const item = current.contentItems.find((record) => record.id === schedule?.contentItemId);
    if (!schedule || !item) throw new Error('Schedule or content item not found.');
    assertManualPublish(item, schedule.versionId, input, current);
    const publish = { ...recordBase(), scheduleId, contentItemId: item.id, variantId: schedule.variantId, versionId: schedule.versionId, channel: schedule.channel, method: 'MANUAL' as const, status: 'PUBLISHED' as const, externalUrl: input.externalUrl, publishedAt: new Date(input.publishedAt).toISOString(), proofNote: input.proofNote, attempts: 1 };
    const schedules = current.schedules.map((record) => record.id === scheduleId ? { ...record, status: 'PUBLISHED' as const, updatedAt: isoNow(), updatedBy: session.userId, revision: record.revision + 1 } : record);
    const contentItems = current.contentItems.map((record) => record.id === item.id ? { ...record, lifecycleState: 'PUBLISHED' as const, updatedAt: isoNow(), updatedBy: session.userId, revision: record.revision + 1 } : record);
    const event = audit('publish.confirmed', 'PublishRecord', publish.id, `Recorded verified manual publication proof for ${schedule.channel}.`, schedule.versionId);
    await commit({ ...current, publishRecords: [publish, ...current.publishRecords], schedules, contentItems, auditEvents: [event, ...current.auditEvents] }, ['publishRecords', 'schedules', 'contentItems', 'auditEvents']);
    return publish;
  }, [audit, commit, recordBase, session]);

  const addAsset = useCallback(async (raw: AssetInput) => {
    if (!session) return;
    assertCan(session.role, 'asset.view');
    const input = assetInputSchema.parse(raw);
    const current = stateRef.current;
    const asset = { ...recordBase(), ...input, assetNumber: `AST-${new Date().getFullYear()}-${String(current.assets.length + 1).padStart(3, '0')}`, rightsStatus: 'MISSING' as const, usageContentItemIds: [] };
    const event = audit('asset.linked', 'ContentAsset', asset.id, `Linked ${asset.name} from ${asset.sourceProvider}; rights confirmation is required.`);
    await commit({ ...current, assets: [asset, ...current.assets], auditEvents: [event, ...current.auditEvents] }, ['assets', 'auditEvents']);
    return asset;
  }, [audit, commit, recordBase, session]);

  const setAssetRights = useCallback(async (assetId: string, rightsStatus: ContentSocialState['assets'][number]['rightsStatus']) => {
    if (!session) return;
    const current = stateRef.current;
    const assets = current.assets.map((item) => item.id === assetId ? { ...item, rightsStatus, updatedAt: isoNow(), updatedBy: session.userId, revision: item.revision + 1 } : item);
    const event = audit('asset.rights_changed', 'ContentAsset', assetId, `Rights status changed to ${rightsStatus}.`);
    await commit({ ...current, assets, auditEvents: [event, ...current.auditEvents] }, ['assets', 'auditEvents']);
  }, [audit, commit, session]);

  const addCommunityRecord = useCallback(async (raw: CommunityInput) => {
    if (!session) return;
    assertCan(session.role, 'community.manage');
    const input = communityInputSchema.parse(raw);
    const current = stateRef.current;
    const record = { ...recordBase(), ...input, channel: input.channel as ContentSocialState['communityRecords'][number]['channel'], status: 'NEW' as const };
    const event = audit('community.captured', 'CommunityRecord', record.id, `Captured ${record.classification} from ${record.channel}.`);
    await commit({ ...current, communityRecords: [record, ...current.communityRecords], auditEvents: [event, ...current.auditEvents] }, ['communityRecords', 'auditEvents']);
    return record;
  }, [audit, commit, recordBase, session]);

  const updateCommunityStatus = useCallback(async (recordId: string, nextStatus: ContentSocialState['communityRecords'][number]['status']) => {
    if (!session) return;
    assertCan(session.role, 'community.manage');
    const current = stateRef.current;
    const communityRecords = current.communityRecords.map((item) => item.id === recordId ? { ...item, status: nextStatus, updatedAt: isoNow(), updatedBy: session.userId, revision: item.revision + 1 } : item);
    const event = audit('community.status_changed', 'CommunityRecord', recordId, `Community record moved to ${nextStatus}.`);
    await commit({ ...current, communityRecords, auditEvents: [event, ...current.auditEvents] }, ['communityRecords', 'auditEvents']);
  }, [audit, commit, session]);

  const addListeningSignal = useCallback(async (raw: ListeningInput) => {
    if (!session) return;
    assertCan(session.role, 'listening.manage');
    const input = listeningInputSchema.parse(raw);
    const current = stateRef.current;
    const signal = { ...recordBase(), ...input, channel: input.channel as ContentSocialState['listeningSignals'][number]['channel'], status: 'NEW' as const };
    const event = audit('listening.captured', 'ListeningSignal', signal.id, `Captured ${signal.severity} signal: ${signal.topic}.`);
    await commit({ ...current, listeningSignals: [signal, ...current.listeningSignals], auditEvents: [event, ...current.auditEvents] }, ['listeningSignals', 'auditEvents']);
    return signal;
  }, [audit, commit, recordBase, session]);

  const convertListeningSignal = useCallback(async (signalId: string) => {
    if (!session) return;
    const current = stateRef.current;
    const signal = current.listeningSignals.find((item) => item.id === signalId);
    if (!signal) throw new Error('Signal not found.');
    const idea = await createIdea({ title: signal.topic, summary: signal.summary, source: `${signal.channel}: ${signal.sourceUrl}`, owner: signal.owner, priority: signal.severity });
    if (!idea) return;
    const refreshed = stateRef.current;
    const listeningSignals = refreshed.listeningSignals.map((item) => item.id === signalId ? { ...item, status: 'CONVERTED' as const, convertedRecordType: 'IDEA' as const, convertedRecordId: idea.id, updatedAt: isoNow(), updatedBy: session.userId, revision: item.revision + 1 } : item);
    const event = audit('listening.converted', 'ListeningSignal', signalId, `Converted signal to content idea “${idea.title}”.`);
    await commit({ ...refreshed, listeningSignals, auditEvents: [event, ...refreshed.auditEvents] }, ['listeningSignals', 'auditEvents']);
  }, [audit, commit, createIdea, session]);

  const addMetric = useCallback(async (raw: MetricInput) => {
    if (!session) return;
    assertCan(session.role, 'metric.manage');
    const input = metricInputSchema.parse(raw);
    const current = stateRef.current;
    const metric = { ...recordBase(), ...input, channel: input.channel as ContentSocialState['metrics'][number]['channel'], verifiedBy: input.sourceType === 'VERIFIED' ? session.displayName : null };
    const event = audit('metric.recorded', 'MetricObservation', metric.id, `Recorded ${metric.value} ${metric.metric} as ${metric.sourceType}.`);
    await commit({ ...current, metrics: [metric, ...current.metrics], auditEvents: [event, ...current.auditEvents] }, ['metrics', 'auditEvents']);
    return metric;
  }, [audit, commit, recordBase, session]);

  const markNotificationRead = useCallback(async (notificationId: string) => {
    if (!session) return;
    const current = stateRef.current;
    const notifications = current.notifications.map((item) => item.id === notificationId ? { ...item, readAt: isoNow(), updatedAt: isoNow(), updatedBy: session.userId, revision: item.revision + 1 } : item);
    await commit({ ...current, notifications }, ['notifications']);
  }, [commit, session]);

  const resetDemo = useCallback(async () => {
    const next = await repository.resetDemo();
    applyState(next);
    setSession({ ...DEMO_SESSION });
    setWarning('Development demo data was restored.');
    setStatus('loaded');
  }, [applyState, repository]);

  const signIn = useCallback(async (email: string, password: string) => {
    setMutating(true);
    setError(undefined);
    try {
      await repository.signIn(email, password);
      await reload();
    } catch (authError) {
      setStatus('restricted');
      setError(authError instanceof Error ? authError.message : 'Sign-in failed.');
      throw authError;
    } finally {
      setMutating(false);
    }
  }, [reload, repository]);

  const signOut = useCallback(async () => {
    setMutating(true);
    try {
      await repository.signOut();
      await reload();
    } finally {
      setMutating(false);
    }
  }, [reload, repository]);

  const issueApprovalLink = useCallback(async (approvalId: string) => {
    const token = await repository.issueApprovalToken(approvalId);
    return `${window.location.origin}${window.location.pathname}?client_approval=${encodeURIComponent(token)}`;
  }, [repository]);

  return {
    state, session, status, warning, error, mutating, reload, resetDemo, signIn, signOut,
    actions: {
      createIdea, convertIdea, createBrief, setBriefStatus, createContentFromBrief, transitionContent,
      createVersion, requestApproval, decideApproval, scheduleContent, confirmManualPublish,
      addAsset, setAssetRights, addCommunityRecord, updateCommunityStatus, addListeningSignal,
      convertListeningSignal, addMetric, markNotificationRead, issueApprovalLink,
    },
  };
}
