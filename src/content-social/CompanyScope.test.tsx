import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CompanyScope } from './CompanyScope';
import { loadCompanyDirectory, publisherCommand } from './publisher';

vi.mock('./publisher', async importOriginal => ({ ...await importOriginal<typeof import('./publisher')>(), loadCompanyDirectory: vi.fn(), publisherCommand: vi.fn() }));
const directory = {
  workspaces: [{ id: 'w', name: 'Workspace' }],
  companies: [{ id: 'a', workspace_id: 'w', name: 'DE Labs' }, { id: 'b', workspace_id: 'w', name: 'Quicks Supplements UK' }],
  brands: [{ id: 'aa', workspace_id: 'w', client_id: 'a', name: 'Lab brand', timezone: 'Africa/Lagos' }, { id: 'bb', workspace_id: 'w', client_id: 'b', name: 'Supplement brand', timezone: 'Europe/London' }],
  memberships: [{ workspace_id: 'w', client_id: 'a', brand_id: 'aa', role: 'CS_MANAGER' as const }, { workspace_id: 'w', client_id: 'b', brand_id: 'bb', role: 'CS_MANAGER' as const }],
};
describe('company and brand selector', () => {
  afterEach(cleanup);
  beforeEach(() => { vi.clearAllMocks(); vi.mocked(loadCompanyDirectory).mockResolvedValue(directory); });
  it('switches companies, resets child state, and lists only that company’s brands', async () => {
    render(<CompanyScope>{scope => <><p>{scope.brandName} records</p><input aria-label="Draft" /></>}</CompanyScope>);
    await screen.findByText('Lab brand records');
    await userEvent.type(screen.getByLabelText('Draft'), 'Do not carry across companies');
    await userEvent.selectOptions(screen.getByLabelText('Company'), 'b');
    expect(screen.getByText('Supplement brand records')).toBeInTheDocument();
    expect(screen.getByLabelText('Draft')).toHaveValue('');
    expect(screen.queryByRole('option', { name: 'Lab brand' })).not.toBeInTheDocument();
  });
  it('does not infer company onboarding from brand management', async () => {
    render(<CompanyScope>{() => <p>Records</p>}</CompanyScope>);
    await screen.findByText('Records');
    expect(screen.queryByRole('button', { name: 'Add company' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add brand' })).not.toBeInTheDocument();
  });
  it('allows explicitly scoped workspace managers to onboard', async () => {
    vi.mocked(loadCompanyDirectory).mockResolvedValue({ ...directory, memberships: [{ workspace_id: 'w', client_id: null, brand_id: null, role: 'MODULE_ADMIN' }] });
    vi.mocked(publisherCommand).mockResolvedValue('new-company');
    render(<CompanyScope>{() => <p>Records</p>}</CompanyScope>);
    await userEvent.click(await screen.findByRole('button', { name: 'Add company' }));
    await userEvent.type(screen.getByLabelText('Company name'), 'A future company');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(publisherCommand).toHaveBeenCalledWith('company.create', expect.objectContaining({ workspace_id: 'w', name: 'A future company' }));
  });
  it('fails closed when membership lookup fails', async () => {
    vi.mocked(loadCompanyDirectory).mockRejectedValue(new Error('Access unavailable'));
    render(<CompanyScope>{() => <p>Private records</p>}</CompanyScope>);
    expect(await screen.findByRole('alert')).toHaveTextContent('Access unavailable');
    expect(screen.queryByText('Private records')).not.toBeInTheDocument();
  });
});
