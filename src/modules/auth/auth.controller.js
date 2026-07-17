import * as authService from './auth.service.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Login successful',
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { code: 'AUTH_FAILED', message: error.message },
    });
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    const result = await authService.refresh(refresh_token);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { code: 'REFRESH_FAILED', message: 'Invalid or expired refresh token' },
    });
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { new_password } = req.body;
    
    await authService.changePassword(req.user.auth_id, new_password, req.user.id);
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: { code: 'PASSWORD_CHANGE_FAILED', message: error.message },
    });
  }
};

export const logout = async (req, res, next) => {
  try {
    await authService.logout(req.token);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: { code: 'LOGOUT_FAILED', message: error.message } });
  }
};

export const getMe = async (req, res, next) => {
  // req.user is already populated by verifyToken middleware
  res.status(200).json({
    success: true,
    data: req.user,
    message: 'User profile retrieved successfully',
  });
};

export const updateMe = async (req, res, next) => {
  try {
    const updatedUser = await authService.updateProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: error.message } });
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body.email);
    res.status(200).json({
      success: true,
      message: 'If the email exists, a reset code has been sent.',
    });
  } catch (error) {
    // Return 200 to prevent email enumeration, but log the error
    res.status(200).json({
      success: true,
      message: 'If the email exists, a reset code has been sent.',
    });
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.body);
    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    res.status(400).json({ success: false, error: { code: 'RESET_FAILED', message: error.message } });
  }
};
