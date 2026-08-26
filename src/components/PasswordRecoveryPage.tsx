import { useState, type FormEvent } from 'react';
import { AuthField, AuthLayout, AuthSubmitButton } from './AuthLayout';
import { isSupabaseConfigured, supabase } from '../supabaseClient';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PasswordRecoveryPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(cleanEmail)) {
      setEmailError('Enter a valid work email address.');
      return;
    }
    setEmailError(null);
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/password-update`,
        });
      } catch {
        // This response intentionally remains generic to avoid account enumeration.
      }
    }
    setSubmitted(true);
  };

  return (
    <AuthLayout title="Reset your password" footer={<a href="/login" className="font-semibold text-[#335AA8] underline underline-offset-4">Return to sign in</a>}>
      {submitted ? (
        <div className="border-l-4 border-[#246B4A] bg-[#E4F0E9] px-4 py-4 text-sm leading-6 text-[#1B5238]" role="status">
          If the address is registered for COS, we have sent password-reset instructions. Check your inbox and follow the secure link.
        </div>
      ) : (
        <form className="space-y-6" onSubmit={submit} noValidate>
          <p className="text-sm leading-6 text-[#5E6872]">Enter your work email. For security, this screen gives the same response whether or not an account exists.</p>
          <AuthField id="recovery-email" label="Work email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} error={emailError ?? undefined} required />
          <AuthSubmitButton>Send secure reset link</AuthSubmitButton>
        </form>
      )}
    </AuthLayout>
  );
}
