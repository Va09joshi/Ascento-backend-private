import * as userService from './users.service.js';

export const createUser = async (req, res, next) => {
  try {
    const { user, tempPassword } = await userService.createUser({ ...req.body, created_by: req.user.id }, req.file);

    // In production, we wouldn't return the temp password if email works
    // but useful for debugging if email queue isn't active
    res.status(201).json({
      success: true,
      data: { ...user, tempPassword },
      message: 'User created and invite sent'
    });
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    const users = await userService.listUsers(req.query);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body, req.file);
    res.status(200).json({ success: true, data: user, message: 'User updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deactivateUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const linkParent = async (req, res, next) => {
  try {
    await userService.linkParent(req.body);
    res.status(200).json({ success: true, message: 'Parent linked successfully' });
  } catch (error) {
    next(error);
  }
};
