import { useState } from 'react';
import { AuthLayout } from './AuthLayout';
import { getConfirmationToken } from '../auth/confirmationUrl';
import { isSupabaseConfigured, supabase } from '../supabaseClient';

export default function AuthConfirmationPage() {
  const confirmation = getConfirmationToken(new URLSearchParams(window.location.search));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const continueToSetup = async () => {
    if (!confirmation || !isSupabaseConfigured) return;
    setIsSubmitting(true);
    setError(null);
    const { error: verificationError } = await supabase.auth.verifyOtp({
      token_hash: confirmation.tokenHash,
      type: confirmation.type,
    });
    if (verificationError) {
      setError('This secure setup link is unavailable or has expired. Request a fresh link and try again.');
      setIsSubmitting(false);
      return;
    }
    window.location.assign('/auth/complete');
  };

  return (
    <AuthLayout
      title="Confirm secure setup"
      footer={<a href="/login" className="font-semibold text-[#335AA8] underline underline-offset-4">Return to sign in</a>}
    >
      {confirmation ? (
        <div className="space-y-6">
          <p className="text-sm leading-6 text-[#5E6872]">
            Your setup link is ready. Select the button below to continue securely. This extra step prevents email scanners from using your one-time link before you do.
          </p>
          <button
            type="button"
            onClick={() => void continueToSetup()}
            disabled={isSubmitting}
            className="flex min-h-12 w-full items-center justify-center rounded-[12px] bg-[#335AA8] px-4 text-sm font-semibold text-white transition hover:bg-[#284986] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#335AA8] disabled:cursor-wait disabled:opacity-70"
          >
            {isSubmitting ? 'Verifying secure link...' : 'Continue to set password'}
          </button>
          {error && <p className="border-l-4 border-[#A63A32] bg-[#F6E3E1] px-4 py-4 text-sm leading-6 text-[#7E2D28]" role="alert">{error}</p>}
        </div>
      ) : (
        <div className="border-l-4 border-[#A63A32] bg-[#F6E3E1] px-4 py-4 text-sm leading-6 text-[#7E2D28]" role="alert">
          This secure setup link is unavailable or has expired. Request a new password-reset link or ask your COS administrator to resend your invitation.
        </div>
      )}
    </AuthLayout>
  );
}
