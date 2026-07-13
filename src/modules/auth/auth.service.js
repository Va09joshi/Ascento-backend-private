import { supabaseAdmin, createAuthClient } from '../../config/supabase.js';
import logger from '../../utils/logger.js';

export const login = async (email, password) => {
  if (!process.env.SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('BACKEND_CONFIG_ERROR: The SUPABASE_ANON_KEY environment variable is absolutely missing on the server. Please add it to Render.');
  }

  const authClient = createAuthClient();
  const { data, error } = await authClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`SUPABASE_AUTH_ERROR: ${error.message} (Key used: ${(process.env.SUPABASE_ANON_KEY || '').substring(0, 5)}...)`);
  }

  // Fetch custom user details
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('id, role, full_name, email, must_change_password, branch_id, is_active')
    .eq('auth_id', data.user.id)
    .single();

  if (userError || !user) {
    throw new Error('User record not found in system.');
  }

  if (!user.is_active) {
    throw new Error('Your account has been deactivated. Please contact administration.');
  }

  return {
    user,
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
    },
  };
};

export const refresh = async (refreshToken) => {
  const { data, error } = await supabaseAdmin.auth.refreshSession({ refresh_token: refreshToken });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in,
  };
};

export const changePassword = async (authId, newPassword, userId) => {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(authId, {
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }

  // Update must_change_password flag
  const { error: dbError } = await supabaseAdmin
    .from('users')
    .update({ must_change_password: false, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (dbError) {
    logger.error('Failed to update must_change_password flag', { error: dbError.message });
    // Don't throw, password was changed successfully, but flag failed.
  }
};

export const logout = async (token) => {
  const { error } = await supabaseAdmin.auth.admin.signOut(token);
  if (error) throw new Error(error.message);
};
