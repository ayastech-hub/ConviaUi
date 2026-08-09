const ONBOARDING_KEY = 'convia.onboardingSeen';

export function hasSeenOnboarding(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === '1';
  } catch {
    return false;
  }
}

export function markOnboardingSeen(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, '1');
  } catch {
    // private mode — ignore
  }
}
