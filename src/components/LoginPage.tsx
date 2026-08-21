import { useState, type FormEvent } from 'react';
import { getUserRoles } from '../auth/mockRoles';
import { getPostLoginDestination } from '../auth/postLoginRouting';
import { AuthField, AuthLayout, AuthSubmitButton } from './AuthLayout';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!email.trim()) nextErrors.email = 'Email is required.';
    else if (!EMAIL_PATTERN.test(email)) nextErrors.email = 'Enter a valid email address.';
    if (!password) nextErrors.password = 'Password is required.';
    else if (password.length < MIN_PASSWORD_LENGTH) nextErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      const roles = await getUserRoles(email);
      const destination = getPostLoginDestination(roles);

      if (destination.type === 'no-access') {
        setErrors({ access: 'No platform access assigned yet. Contact your administrator.' });
        return;
      }

      window.location.assign(destination.href);
    }
  };

  return (
    <AuthLayout title="Welcome back">
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <AuthField id="login-email" label="Work email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} error={errors.email} required />
        <AuthField id="login-password" label="Password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} error={errors.password} required minLength={MIN_PASSWORD_LENGTH} />
        {errors.access && <p role="alert" className="rounded-xl border border-[#A63A32]/30 bg-[#A63A32]/5 px-4 py-3 text-sm text-[#A63A32]">{errors.access}</p>}
        <AuthSubmitButton>Sign in to workspace</AuthSubmitButton>
      </form>
    </AuthLayout>
  );
}
