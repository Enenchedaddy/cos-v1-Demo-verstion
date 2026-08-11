import React from 'react';
import { Building2 } from 'lucide-react';

interface SidebarEntityScopeProps {
  workspaceName: string;
  companyScopes: readonly string[];
  groupScopes: readonly string[];
}

type ScopeMode = 'company' | 'group';

export default function SidebarEntityScope({
  workspaceName,
  companyScopes,
  groupScopes,
}: SidebarEntityScopeProps) {
  const scopeId = React.useId();
  const [scopeMode, setScopeMode] = React.useState<ScopeMode>('company');
  const [selectedScopes, setSelectedScopes] = React.useState<Record<ScopeMode, string>>({
    company: companyScopes[0] ?? '',
    group: groupScopes[0] ?? '',
  });
  const availableScopes = scopeMode === 'company' ? companyScopes : groupScopes;

  return (
    <section className="workspace-entity-scope" aria-labelledby={`${scopeId}-label`}>
      <label
        id={`${scopeId}-label`}
        htmlFor={`${scopeId}-select`}
        className="workspace-entity-scope__label"
      >
        Entity scope
      </label>
      <div className="workspace-entity-scope__row">
        <Building2 size={15} className="workspace-entity-scope__icon" aria-hidden="true" />
        <select
          id={`${scopeId}-select`}
          value={selectedScopes[scopeMode]}
          onChange={(event) =>
            setSelectedScopes((current) => ({
              ...current,
              [scopeMode]: event.target.value,
            }))
          }
          className="workspace-entity-scope__select"
          aria-label={`${workspaceName} ${scopeMode} entity scope`}
        >
          {availableScopes.map((scope) => (
            <option key={scope} value={scope}>
              {scope}
            </option>
          ))}
        </select>

        <div className="workspace-entity-scope__modes" aria-label="Entity scope level">
          {(['company', 'group'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setScopeMode(mode)}
              className="workspace-entity-scope__mode"
              data-active={scopeMode === mode}
              aria-pressed={scopeMode === mode}
            >
              {mode === 'company' ? 'Company' : 'Group'}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
