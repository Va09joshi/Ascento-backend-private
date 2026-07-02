import { supabaseAdmin } from '../config/supabase.js';

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing or invalid token' } });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } });
    }

    // Fetch user details from our users table
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*, branches(name)')
      .eq('auth_id', data.user.id)
      .single();

    if (userError || !user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'User record not found' } });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Account deactivated' } });
    }

    req.user = user;
    req.token = token; // Can be useful for passing to other services if needed
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
  }
  
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
  }
  
  next();
};

export const requirePasswordChanged = (req, res, next) => {
  if (req.user?.must_change_password && req.path !== '/change-password') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'PASSWORD_CHANGE_REQUIRED',
        message: 'You must change your password before continuing.',
      },
    });
  }
  next();
};
