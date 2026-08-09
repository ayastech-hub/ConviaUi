export interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

/** Simple heuristic password-strength meter used on the signup form. */
export function passwordStrength(pwd: string): PasswordStrength {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'];
  const colors = ['var(--destructive)', 'var(--destructive)', 'var(--warning)', 'var(--warning)', 'var(--positive)', 'var(--positive)'];
  return { score, label: labels[score], color: colors[score] };
}
