import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SocialPublisher from './SocialPublisher';
import { createSeedState, DELABS_SCOPE, DEMO_SESSION } from './seed';
import { loadPublisher } from './publisher';

vi.mock('./publisher', async importOriginal => ({ ...await importOriginal<typeof import('./publisher')>(), loadPublisher: vi.fn(), invokePublisher: vi.fn(), publisherCommand: vi.fn() }));
const props = { scope: DELABS_SCOPE, state: createSeedState(), session: { ...DEMO_SESSION, mode: 'supabase' as const }, onReload: vi.fn(), onRouteChange: vi.fn(), legacy: <p>Existing publication proof</p> };
describe('Social Publisher submenu', () => {
  afterEach(cleanup);
  beforeEach(() => { vi.clearAllMocks(); vi.mocked(loadPublisher).mockResolvedValue({ accounts: [], jobs: [] }); });
  it('lives under Content & Social and retains the manual evidence view', async () => {
    render(<SocialPublisher {...props} />);
    expect(screen.getByText('Content & Social / Social Publisher')).toBeInTheDocument();
    await screen.findByText(/No account connected/);
    expect(screen.getByText('Existing manual publishing and evidence')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publish now' })).toBeDisabled();
  });
  it('does not give read-only members connection or publishing actions', async () => {
    render(<SocialPublisher {...props} session={{ ...props.session, role: 'EXECUTIVE_VIEWER' }} />);
    await screen.findByText(/No account connected/);
    expect(screen.queryByRole('button', { name: 'Connect Instagram' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create post for review' })).toBeDisabled();
  });
  it('shows a service error, not invented accounts', async () => {
    vi.mocked(loadPublisher).mockRejectedValue(new Error('Service unavailable'));
    render(<SocialPublisher {...props} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Service unavailable');
  });
  it('routes staff to existing brief and approval screens', async () => {
    render(<SocialPublisher {...props} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open approvals' }));
    expect(props.onRouteChange).toHaveBeenCalledWith('Approvals');
  });
  it('ignores an old scope response after unmount', async () => {
    let resolve!: (value: { accounts: []; jobs: [] }) => void;
    vi.mocked(loadPublisher).mockImplementation(() => new Promise(done => { resolve = done; }));
    const view = render(<SocialPublisher {...props} />);
    view.unmount(); resolve({ accounts: [], jobs: [] });
    await waitFor(() => expect(screen.queryByText('Social Publisher')).not.toBeInTheDocument());
  });
});
