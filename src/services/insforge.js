import { createClient } from '@insforge/sdk';

const baseUrl = import.meta.env.VITE_INSFORGE_URL || 'https://pad6r8rd.us-east.insforge.app';
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY || 'anon_a245ba549191ea81a518b0e93381f2005f078b5e01ff9ec24e2aae000bae59f1';

// Read any saved session from localStorage to prevent auth loss on refresh
let initialToken = undefined;
let initialUser = null;
if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem('ideavault_auth_session');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.accessToken) {
        initialToken = parsed.accessToken;
        initialUser = parsed.user || null;
      }
    }
  } catch (err) {
    console.warn('Could not read cached session:', err);
  }
}

export const insforge = createClient({
  baseUrl,
  anonKey,
  accessToken: initialToken,
});

// Prime tokenManager with saved session immediately if present
if (initialToken && initialUser) {
  try {
    insforge.tokenManager.saveSession({
      accessToken: initialToken,
      user: initialUser,
    });
  } catch (err) {
    console.warn('Failed to prime token manager:', err);
  }
}
