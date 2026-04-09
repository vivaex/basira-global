import { supabase } from './supabase';

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: any;
}

export const authService = {
  /**
   * Register a new user with email and password.
   * Supabase trigger will automatically create a row in the 'profiles' table.
   */
  async signUp(email: string, password: string, fullName: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) return { success: false, error: error.message };
    return { success: true, user: data.user };
  },

  /**
   * Sign in with email and password.
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { success: false, error: error.message };
    return { success: true, user: data.user };
  },

  /**
   * Sign out current user.
   */
  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },

  /**
   * Send a password reset email.
   */
  async resetPassword(email: string): Promise<AuthResponse> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  /**
   * GDPR Compliance: Delete user account and all associated data.
   * Note: The 'ON DELETE CASCADE' in SQL schema handles related tables.
   */
  async deleteAccount(): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/auth/delete-account', { method: 'POST' });
      if (!res.ok) throw new Error('Deletion failed');
      await this.signOut();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Get the current active session.
   */
  async getSession() {
    return await supabase.auth.getSession();
  },

  /**
   * Listen for authentication state changes.
   */
  onAuthStateChange(callback: (event: any, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};
