import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ScopedContentSocialModule as ContentSocialModule } from './ContentSocialModule';
import { createSeedState, DELABS_SCOPE, DEMO_SESSION } from './seed';

const action = vi.fn(async () => undefined);
const hook = {
  state: createSeedState(),
  session: DEMO_SESSION,
  status: 'loaded' as const,
  warning: undefined,
  error: undefined,
  mutating: false,
  reload: action,
  resetDemo: action,
  signIn: action,
  signOut: action,
  actions: {
    createIdea: action, convertIdea: action, createBrief: action, setBriefStatus: action,
    createContentFromBrief: action, transitionContent: action, createVersion: action,
    requestApproval: action, decideApproval: action, scheduleContent: action,
    confirmManualPublish: action, addAsset: action, setAssetRights: action,
    addCommunityRecord: action, updateCommunityStatus: action, addListeningSignal: action,
    convertListeningSignal: action, addMetric: action, markNotificationRead: action, issueApprovalLink: action,
  },
};

vi.mock('./useContentSocial', () => ({ useContentSocial: () => hook }));

const props = {
  scope: DELABS_SCOPE,
  globalSearch: '', scopeMode: 'company' as const, notificationOpen: false,
  onNotificationClose: vi.fn(), onRouteChange: vi.fn(),
};

describe('ContentSocialModule', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it('omits the redundant area dropdown and preserves section navigation', () => {
    render(<ContentSocialModule {...props} activeRoute="Overview" />);
    expect(screen.queryByLabelText('Content & Social area')).not.toBeInTheDocument();
    expect(screen.queryByText('Content & Social area')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /open publisher/i }));
    expect(props.onRouteChange).toHaveBeenCalledWith('Social Publisher');
  });

  it('renders the governed overview with live seed metrics', () => {
    render(<ContentSocialModule {...props} activeRoute="Overview" />);
    expect(screen.getByRole('heading', { name: /content operations at a glance/i })).toBeInTheDocument();
    expect(screen.getByText(/awaiting approval/i)).toBeInTheDocument();
  });

  it('renders the document-defined Planning & Briefs workspace', () => {
    render(<ContentSocialModule {...props} activeRoute="Planning & Briefs" />);
    expect(screen.getByRole('button', { name: /new idea/i })).toBeInTheDocument();
    expect(screen.getByText(/brief register/i)).toBeInTheDocument();
  });

  it('shows a governed empty state when requested by the simulator', () => {
    render(<ContentSocialModule {...props} activeRoute="Overview" forcedState="empty" />);
    expect(screen.getByRole('heading', { name: /no records in this view/i })).toBeInTheDocument();
  });
});
