import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ScopedContentSocialModule as ContentSocialModule } from './ContentSocialModule';
import { createSeedState, DELABS_SCOPE, DEMO_SESSION } from './seed';
import type { CompanyDirectory } from './publisher';

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

  const directory: CompanyDirectory = {
    workspaces: [{ id: DELABS_SCOPE.workspaceId, name: DELABS_SCOPE.workspaceName }],
    companies: [{ id: DELABS_SCOPE.clientId, workspace_id: DELABS_SCOPE.workspaceId, name: DELABS_SCOPE.clientName }, { id: 'company-b', workspace_id: DELABS_SCOPE.workspaceId, name: 'Second company' }],
    brands: [{ id: DELABS_SCOPE.brandId, workspace_id: DELABS_SCOPE.workspaceId, client_id: DELABS_SCOPE.clientId, name: DELABS_SCOPE.brandName, timezone: 'Africa/Lagos' }, { id: 'brand-b', workspace_id: DELABS_SCOPE.workspaceId, client_id: 'company-b', name: 'Second brand', timezone: 'Europe/London' }, { id: 'read-only', workspace_id: DELABS_SCOPE.workspaceId, client_id: 'company-b', name: 'Read-only brand', timezone: 'Europe/London' }],
    memberships: [{ workspace_id: DELABS_SCOPE.workspaceId, client_id: DELABS_SCOPE.clientId, brand_id: null, role: 'PLANNER' }, { workspace_id: DELABS_SCOPE.workspaceId, client_id: 'company-b', brand_id: 'brand-b', role: 'PLANNER' }, { workspace_id: DELABS_SCOPE.workspaceId, client_id: 'company-b', brand_id: 'read-only', role: 'EXECUTIVE_VIEWER' }],
  };

  it('lists authorized brands across companies and preserves the draft when the destination changes', async () => {
    const onScopeChange = vi.fn();
    render(<ContentSocialModule {...props} directory={directory} onScopeChange={onScopeChange} activeRoute="Planning & Briefs" />);
    fireEvent.click(screen.getByRole('button', { name: /new idea/i }));
    const form = within(screen.getByRole('dialog'));
    expect(form.getByLabelText('Brand')).toHaveValue(DELABS_SCOPE.brandId);
    expect(form.getByRole('option', { name: 'Second company — Second brand' })).toBeEnabled();
    expect(form.getByRole('option', { name: /Read-only brand/ })).toBeDisabled();
    fireEvent.change(form.getByLabelText('Idea title'), { target: { value: 'Brand-specific idea' } });
    fireEvent.change(form.getByLabelText('Summary'), { target: { value: 'Keep my draft' } });
    fireEvent.change(form.getByLabelText('Owner'), { target: { value: 'Planner' } });
    fireEvent.change(form.getByLabelText('Brand'), { target: { value: 'brand-b' } });
    expect(form.getByLabelText('Idea title')).toHaveValue('Brand-specific idea');
    expect(form.getByLabelText('Summary')).toHaveValue('Keep my draft');
    expect(onScopeChange).not.toHaveBeenCalled();
    fireEvent.click(form.getByRole('button', { name: 'Create idea' }));
    await waitFor(() => expect(onScopeChange).toHaveBeenCalledWith(expect.objectContaining({ clientId: 'company-b', brandId: 'brand-b' })));
    expect(action).toHaveBeenCalledWith(expect.objectContaining({ title: 'Brand-specific idea', owner: 'Planner' }), expect.objectContaining({ clientId: 'company-b', brandId: 'brand-b' }));
  });

  it('blocks creation when directory access has no writable brands', () => {
    render(<ContentSocialModule {...props} directory={{ ...directory, memberships: [] }} activeRoute="Planning & Briefs" />);
    fireEvent.click(screen.getByRole('button', { name: /new idea/i }));
    expect(screen.getByRole('button', { name: 'Create idea' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('permission to create ideas');
  });

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
