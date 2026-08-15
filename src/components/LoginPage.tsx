import { useState, type FormEvent } from 'react';
import { AuthField, AuthLayout, AuthSubmitButton, WorkspaceField } from './AuthLayout';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workspace, setWorkspace] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!email.trim()) nextErrors.email = 'Email is required.';
    else if (!EMAIL_PATTERN.test(email)) nextErrors.email = 'Enter a valid email address.';
    if (!password) nextErrors.password = 'Password is required.';
    else if (password.length < MIN_PASSWORD_LENGTH) nextErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    if (!workspace) nextErrors.workspace = 'Choose an operating workspace.';
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      console.log('Login form submitted:', { email: email.trim(), password, workspace });
      window.location.assign(`/app?workspace=${encodeURIComponent(workspace)}`);
    }
  };

  return (
    <AuthLayout
      eyebrow="Secure access"
      title="Welcome back"
      description="Sign in with your COS identity and choose the workspace you need today."
      footer={<>New to COS? <a className="font-semibold text-[#335AA8] hover:underline" href="/signup">Create an account</a></>}
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <AuthField id="login-email" label="Work email" type="email" autoComplete="email" placeholder="name@company.com" value={email} onChange={(event) => setEmail(event.target.value)} error={errors.email} required />
        <AuthField id="login-password" label="Password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} error={errors.password} required minLength={MIN_PASSWORD_LENGTH} />
        <WorkspaceField value={workspace} onChange={setWorkspace} error={errors.workspace} />
        <AuthSubmitButton>Sign in to workspace</AuthSubmitButton>
      </form>
    </AuthLayout>
  );
}
