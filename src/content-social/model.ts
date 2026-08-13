import { z } from 'zod';

export const LIFECYCLE_STATES = [
  'IDEA',
  'BRIEF',
  'ASSIGNED',
  'IN_PRODUCTION',
  'INTERNAL_REVIEW',
  'CLIENT_APPROVAL',
  'SCHEDULED',
  'PUBLISHED',
  'PERFORMANCE_REVIEW',
  'ARCHIVED',
  'CANCELLED',
] as const;

export type LifecycleState = (typeof LIFECYCLE_STATES)[number];

export const EXCEPTION_FLAGS = [
  'BLOCKED',
  'ON_HOLD',
  'OVERDUE',
  'NEEDS_CHANGES',
  'PARTIAL_PUBLISH',
  'PUBLISH_FAILED',
  'QUARANTINED',
] as const;

export type ExceptionFlag = (typeof EXCEPTION_FLAGS)[number];
export type ContentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ContentFormat = 'Static' | 'Carousel' | 'Short video' | 'Long video' | 'Story' | 'Text/thread' | 'Article/newsletter' | 'Live/event' | 'Poll/interactive' | 'Repost/UGC';
export type SocialChannel = 'Instagram' | 'Facebook' | 'TikTok' | 'LinkedIn' | 'YouTube' | 'X' | 'Pinterest' | 'Threads' | 'Snapchat' | 'Google Business Profile';
export type ModuleRole = 'CS_MANAGER' | 'PLANNER' | 'CONTRIBUTOR' | 'SOCIAL_COMMUNITY' | 'PERFORMANCE_ANALYST' | 'ACCOUNT_BRAND' | 'EXECUTIVE_VIEWER' | 'MODULE_ADMIN' | 'CLIENT_APPROVER';

export interface ScopeContext {
  workspaceId: string;
  clientId: string;
  brandId: string;
  workspaceName: string;
  clientName: string;
  brandName: string;
}

export interface ContentSocialSession {
  userId: string;
  displayName: string;
  role: ModuleRole;
  mode: 'supabase' | 'demo';
}

export interface ScopedRecord {
  id: string;
  workspaceId: string;
  clientId: string;
  brandId: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  revision: number;
  archivedAt?: string | null;
  deletedAt?: string | null;
  deletedBy?: string | null;
  deletionReason?: string | null;
  purgeAfter?: string | null;
}

export interface ContentIdea extends ScopedRecord {
  title: string;
  summary: string;
  source: string;
  owner: string;
  priority: ContentPriority;
  status: 'OPEN' | 'CONVERTED' | 'DISMISSED';
  convertedBriefId?: string | null;
}

export interface ContentBrief extends ScopedRecord {
  briefNumber: string;
  title: string;
  objective: string;
  audience: string;
  keyMessage: string;
  callToAction: string;
  channels: SocialChannel[];
  formats: ContentFormat[];
  owner: string;
  dueDate: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'CHANGES_REQUESTED';
  sourceIdeaId?: string | null;
  campaignName?: string | null;
  claimsNotes?: string | null;
}

export interface ExceptionRecord {
  flag: ExceptionFlag;
  reason: string;
  owner: string;
  openedAt: string;
  openedBy: string;
  resolvedAt?: string | null;
  resolution?: string | null;
}

export interface ContentItem extends ScopedRecord {
  contentNumber: string;
  title: string;
  briefId: string;
  owner: string;
  lifecycleState: LifecycleState;
  priority: ContentPriority;
  dueDate: string;
  primaryChannel: SocialChannel;
  format: ContentFormat;
  currentVersionId?: string | null;
  exceptions: ExceptionRecord[];
  tags: string[];
}

export interface PlatformVariant extends ScopedRecord {
  contentItemId: string;
  channel: SocialChannel;
  format: ContentFormat;
  title: string;
  copy: string;
  callToAction: string;
  currentVersionId?: string | null;
}

export interface ContentVersion extends ScopedRecord {
  contentItemId: string;
  variantId: string;
  versionNumber: number;
  copy: string;
  changeSummary: string;
  externalAssetUrl?: string | null;
  submittedAt?: string | null;
  immutable: true;
}

export interface ApprovalTarget {
  variantId: string;
  versionId: string;
  channel: SocialChannel;
  versionNumber: number;
}

export interface ApprovalDecision {
  id: string;
  action: 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED';
  actorId: string;
  actorName: string;
  comment: string;
  decidedAt: string;
}

export interface ContentApproval extends ScopedRecord {
  approvalNumber: string;
  contentItemId: string;
  title: string;
  routeName: string;
  stepName: string;
  status: 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED' | 'STALE' | 'EXPIRED';
  targets: ApprovalTarget[];
  requestedBy: string;
  requestedAt: string;
  dueAt: string;
  clientVisible: boolean;
  secureTokenExpiresAt?: string | null;
  decisions: ApprovalDecision[];
}

export interface ContentSchedule extends ScopedRecord {
  contentItemId: string;
  variantId: string;
  versionId: string;
  channel: SocialChannel;
  plannedAt: string;
  timezone: string;
  publishMethod: 'MANUAL' | 'CONNECTOR';
  status: 'PLANNED' | 'READY' | 'PUBLISHED' | 'FAILED' | 'CANCELLED';
}

export interface PublishRecord extends ScopedRecord {
  scheduleId: string;
  contentItemId: string;
  variantId: string;
  versionId: string;
  channel: SocialChannel;
  method: 'MANUAL' | 'CONNECTOR';
  status: 'PENDING' | 'PUBLISHED' | 'FAILED';
  externalUrl?: string | null;
  externalId?: string | null;
  publishedAt?: string | null;
  proofNote?: string | null;
  lastError?: string | null;
  attempts: number;
}

export interface ContentAsset extends ScopedRecord {
  assetNumber: string;
  name: string;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO' | 'OTHER';
  sourceProvider: 'Drive' | 'OneDrive' | 'Dropbox' | 'Canva' | 'Adobe' | 'CapCut' | 'Other';
  sourceUrl: string;
  rightsStatus: 'VALID' | 'EXPIRING' | 'EXPIRED' | 'MISSING' | 'QUARANTINED';
  rightsExpiresAt?: string | null;
  owner: string;
  usageContentItemIds: string[];
}

export interface CommunityRecord extends ScopedRecord {
  channel: SocialChannel;
  externalThreadUrl: string;
  contactName: string;
  summary: string;
  classification: 'ENQUIRY' | 'COMPLAINT' | 'PRAISE' | 'LEAD' | 'SUPPORT' | 'RISK';
  priority: ContentPriority;
  owner: string;
  status: 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'ESCALATED' | 'RESOLVED';
  responseDraft?: string | null;
  convertedRecordType?: 'TASK' | 'BRIEF' | 'ESCALATION' | null;
  convertedRecordId?: string | null;
}

export interface ListeningSignal extends ScopedRecord {
  channel: SocialChannel;
  sourceUrl: string;
  topic: string;
  summary: string;
  severity: ContentPriority;
  owner: string;
  status: 'NEW' | 'TRIAGED' | 'CONVERTED' | 'RESOLVED';
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'MIXED';
  convertedRecordType?: 'IDEA' | 'TASK' | 'ESCALATION' | null;
  convertedRecordId?: string | null;
}

export interface MetricObservation extends ScopedRecord {
  contentItemId: string;
  channel: SocialChannel;
  metric: 'IMPRESSIONS' | 'REACH' | 'ENGAGEMENTS' | 'CLICKS' | 'LEADS' | 'CONVERSIONS' | 'REVENUE';
  value: number;
  periodStart: string;
  periodEnd: string;
  sourceType: 'VERIFIED' | 'IMPORTED' | 'MANUAL' | 'ESTIMATED';
  sourceReference: string;
  verifiedBy?: string | null;
}

export interface ModuleNotification extends ScopedRecord {
  userId: string;
  type: 'ASSIGNMENT' | 'COMMENT' | 'STATUS' | 'APPROVAL' | 'OVERDUE' | 'PUBLISH_FAILURE' | 'LISTENING_CRITICAL';
  title: string;
  message: string;
  recordType: string;
  recordId: string;
  critical: boolean;
  readAt?: string | null;
}

export interface ModuleAuditEvent {
  id: string;
  workspaceId: string;
  clientId: string;
  brandId: string;
  occurredAt: string;
  actorType: 'USER' | 'SYSTEM' | 'CLIENT_TOKEN';
  actorId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  targetVersion?: string | null;
  result: 'SUCCESS' | 'FAILURE' | 'REVERSAL';
  summary: string;
  requestId: string;
}

export interface ContentSocialState {
  ideas: ContentIdea[];
  briefs: ContentBrief[];
  contentItems: ContentItem[];
  variants: PlatformVariant[];
  versions: ContentVersion[];
  approvals: ContentApproval[];
  schedules: ContentSchedule[];
  publishRecords: PublishRecord[];
  assets: ContentAsset[];
  communityRecords: CommunityRecord[];
  listeningSignals: ListeningSignal[];
  metrics: MetricObservation[];
  notifications: ModuleNotification[];
  auditEvents: ModuleAuditEvent[];
}

const requiredText = (label: string, max = 500) => z.string().trim().min(1, `${label} is required`).max(max, `${label} is too long`);
const httpUrl = z.string().trim().url('Enter a valid URL').refine((value) => ['http:', 'https:'].includes(new URL(value).protocol), 'Only HTTP and HTTPS links are allowed');

export const ideaInputSchema = z.object({
  title: requiredText('Idea title', 140),
  summary: requiredText('Summary', 1000),
  source: requiredText('Source', 200),
  owner: requiredText('Owner', 120),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
});

export const briefInputSchema = z.object({
  title: requiredText('Brief title', 160),
  objective: requiredText('Objective', 1200),
  audience: requiredText('Audience', 500),
  keyMessage: requiredText('Key message', 800),
  callToAction: requiredText('Call to action', 300),
  owner: requiredText('Owner', 120),
  dueDate: z.string().date('Choose a valid due date'),
  channels: z.array(z.string()).min(1, 'Choose at least one channel'),
  formats: z.array(z.string()).min(1, 'Choose at least one format'),
});

export const versionInputSchema = z.object({
  copy: requiredText('Version copy', 5000),
  changeSummary: requiredText('Change summary', 500),
  externalAssetUrl: z.union([z.literal(''), httpUrl]),
});

export const scheduleInputSchema = z.object({
  plannedAt: z.string().datetime({ local: true }).or(z.string().min(16)),
  timezone: requiredText('Timezone', 80),
});

export const publishInputSchema = z.object({
  externalUrl: httpUrl,
  publishedAt: z.string().min(16, 'Choose the actual publication time'),
  proofNote: requiredText('Publication evidence', 800),
});

export const assetInputSchema = z.object({
  name: requiredText('Asset name', 180),
  sourceUrl: httpUrl,
  owner: requiredText('Owner', 120),
  sourceProvider: z.enum(['Drive', 'OneDrive', 'Dropbox', 'Canva', 'Adobe', 'CapCut', 'Other']),
  type: z.enum(['IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO', 'OTHER']),
});

export const communityInputSchema = z.object({
  channel: z.string().min(1),
  externalThreadUrl: httpUrl,
  contactName: requiredText('Contact name', 140),
  summary: requiredText('Summary', 1200),
  owner: requiredText('Owner', 120),
  classification: z.enum(['ENQUIRY', 'COMPLAINT', 'PRAISE', 'LEAD', 'SUPPORT', 'RISK']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
});

export const listeningInputSchema = z.object({
  channel: z.string().min(1),
  sourceUrl: httpUrl,
  topic: requiredText('Topic', 160),
  summary: requiredText('Summary', 1200),
  owner: requiredText('Owner', 120),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'MIXED']),
});

export const metricInputSchema = z.object({
  contentItemId: z.string().uuid(),
  channel: z.string().min(1),
  metric: z.enum(['IMPRESSIONS', 'REACH', 'ENGAGEMENTS', 'CLICKS', 'LEADS', 'CONVERSIONS', 'REVENUE']),
  value: z.coerce.number().finite().nonnegative(),
  periodStart: z.string().date(),
  periodEnd: z.string().date(),
  sourceType: z.enum(['VERIFIED', 'IMPORTED', 'MANUAL', 'ESTIMATED']),
  sourceReference: requiredText('Source reference', 500),
});

export type IdeaInput = z.infer<typeof ideaInputSchema>;
export type BriefInput = z.infer<typeof briefInputSchema>;
export type VersionInput = z.infer<typeof versionInputSchema>;
export type ScheduleInput = z.infer<typeof scheduleInputSchema>;
export type PublishInput = z.infer<typeof publishInputSchema>;
export type AssetInput = z.infer<typeof assetInputSchema>;
export type CommunityInput = z.infer<typeof communityInputSchema>;
export type ListeningInput = z.infer<typeof listeningInputSchema>;
export type MetricInput = z.infer<typeof metricInputSchema>;
