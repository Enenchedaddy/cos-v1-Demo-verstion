import { useState, type FormEvent } from 'react';
import { AuthField, AuthLayout, AuthSubmitButton } from './AuthLayout';
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { loadRememberedWorkEmail, saveRememberedWorkEmail } from '../auth/rememberedEmail';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export default function LoginPage() {
  const [email, setEmail] = useState(loadRememberedWorkEmail);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => Boolean(loadRememberedWorkEmail()));
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
      if (!isSupabaseConfigured) {
        setErrors({ access: 'Authentication is not configured for this environment. Contact your administrator.' });
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setErrors({ access: 'Unable to sign in with those credentials. Check your email and password.' });
        return;
      }

      saveRememberedWorkEmail(email, rememberMe);
      setPassword('');
      window.location.assign('/app');
    }
  };

  return (
    <AuthLayout title="Welcome back">
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <AuthField id="login-email" label="Work email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} error={errors.email} required />
        <AuthField id="login-password" label="Password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} error={errors.password} required minLength={MIN_PASSWORD_LENGTH} />
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[#52617A]" htmlFor="remember-me">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => {
              const nextRememberMe = event.target.checked;
              setRememberMe(nextRememberMe);
              if (!nextRememberMe) saveRememberedWorkEmail('', false);
            }}
            className="h-4 w-4 rounded border-[#9AA8BC] text-[#335AA8] focus:ring-[#335AA8]"
          />
          <span>Remember my work email on this device</span>
        </label>
        {errors.access && <p role="alert" className="rounded-xl border border-[#A63A32]/30 bg-[#A63A32]/5 px-4 py-3 text-sm text-[#A63A32]">{errors.access}</p>}
        <AuthSubmitButton>Sign in to workspace</AuthSubmitButton>
        <div className="flex justify-end">
          <a href="/password-recovery" className="inline-flex min-h-11 items-center text-sm font-semibold text-[#335AA8] underline decoration-[#335AA8]/30 underline-offset-4 transition hover:text-[#C84F2A] hover:decoration-[#C84F2A]">Forgot password?</a>
        </div>
      </form>
    </AuthLayout>
  );
}
