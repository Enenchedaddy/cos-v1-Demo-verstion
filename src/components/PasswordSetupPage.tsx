import { useEffect, useState, type FormEvent } from 'react';
import { AuthField, AuthLayout, AuthSubmitButton } from './AuthLayout';
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { activateOwnInvitation } from '../auth/userProvisioning';

const MIN_PASSWORD_LENGTH = 12;

export default function PasswordSetupPage() {
  const [isChecking, setIsChecking] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsChecking(false);
      return undefined;
    }
    let active = true;
    const resolveSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (active) {
        setHasRecoverySession(Boolean(data.session));
        setIsChecking(false);
      }
    };
    void resolveSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setHasRecoverySession(Boolean(session));
      setIsChecking(false);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmation) {
      setError('The passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError('Your password could not be updated. Request another secure link and try again.');
      setIsSubmitting(false);
      return;
    }
    try {
      await activateOwnInvitation();
    } catch {
      setError('Your password was updated, but COS account activation could not be completed. Contact the technical provisioning administrator.');
      setIsSubmitting(false);
      return;
    }
    window.location.assign('/app');
  };

  return (
    <AuthLayout title="Set your password" footer={<a href="/login" className="font-semibold text-[#335AA8] underline underline-offset-4">Return to sign in</a>}>
      {isChecking ? <p className="text-sm text-[#5E6872]">Verifying your secure link…</p> : !hasRecoverySession ? (
        <div className="border-l-4 border-[#A63A32] bg-[#F6E3E1] px-4 py-4 text-sm leading-6 text-[#7E2D28]" role="alert">
          This setup link is unavailable or has expired. Request a new password-reset link or ask your COS administrator to resend your invitation.
        </div>
      ) : (
        <form className="space-y-6" onSubmit={submit} noValidate>
          <p className="text-sm leading-6 text-[#5E6872]">Choose a password known only to you. COS administrators cannot see or set employee passwords.</p>
          <AuthField id="new-password" label="New password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} error={error ?? undefined} required minLength={MIN_PASSWORD_LENGTH} />
          <AuthField id="confirm-password" label="Confirm new password" type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required minLength={MIN_PASSWORD_LENGTH} />
          <AuthSubmitButton>{isSubmitting ? 'Saving password…' : 'Save secure password'}</AuthSubmitButton>
        </form>
      )}
    </AuthLayout>
  );
}
