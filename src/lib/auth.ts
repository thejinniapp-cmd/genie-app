import { supabase } from './supabase';

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  });
  if (error) throw error;
}

export async function signInWithEmail(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/` },
  });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/** Returns the org for the current user, or null if not found */
export async function getUserOrg() {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data } = await supabase
    .from('user_organizations')
    .select('org_id, role, organizations(*)')
    .eq('user_id', user.user.id)
    .single();

  return data || null;
}
