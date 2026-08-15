import { useState, type FormEvent } from 'react';
import { AuthField, AuthLayout, AuthSubmitButton, WorkspaceField } from './AuthLayout';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [workspace, setWorkspace] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'Full name is required.';
    if (!email.trim()) nextErrors.email = 'Email is required.';
    else if (!EMAIL_PATTERN.test(email)) nextErrors.email = 'Enter a valid email address.';
    if (!password) nextErrors.password = 'Password is required.';
    else if (password.length < MIN_PASSWORD_LENGTH) nextErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    if (!confirmPassword) nextErrors.confirmPassword = 'Confirm your password.';
    else if (confirmPassword !== password) nextErrors.confirmPassword = 'Passwords do not match.';
    if (!workspace) nextErrors.workspace = 'Choose an operating workspace.';
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      console.log('Signup form submitted:', { name: name.trim(), email: email.trim(), password, confirmPassword, workspace });
      window.location.assign(`/app?workspace=${encodeURIComponent(workspace)}`);
    }
  };

  return (
    <AuthLayout
      eyebrow="Identity registration"
      title="Create your account"
      description="Set up your COS identity and select the operating workspace you will use first."
      footer={<>Already registered? <a className="font-semibold text-[#335AA8] hover:underline" href="/login">Sign in</a></>}
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <AuthField id="signup-name" label="Full name" type="text" autoComplete="name" placeholder="Your full name" value={name} onChange={(event) => setName(event.target.value)} error={errors.name} required />
        <AuthField id="signup-email" label="Work email" type="email" autoComplete="email" placeholder="name@company.com" value={email} onChange={(event) => setEmail(event.target.value)} error={errors.email} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField id="signup-password" label="Password" type="password" autoComplete="new-password" placeholder="8+ characters" value={password} onChange={(event) => setPassword(event.target.value)} error={errors.password} required minLength={MIN_PASSWORD_LENGTH} />
          <AuthField id="signup-confirm-password" label="Confirm password" type="password" autoComplete="new-password" placeholder="Repeat password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} error={errors.confirmPassword} required minLength={MIN_PASSWORD_LENGTH} />
        </div>
        <WorkspaceField value={workspace} onChange={setWorkspace} error={errors.workspace} />
        <AuthSubmitButton>Create account</AuthSubmitButton>
      </form>
    </AuthLayout>
  );
}
