import asyncHandler from 'express-async-handler';
import cloudinary from '../utils/cloudinary.js';
import User from '../models/user.models.js';

// Get user profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    '-password -refreshToken'
  );
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({ user });
});

// Update user profile (fullname, etc.)
const updateProfile = asyncHandler(async (req, res) => {
  const { fullname } = req.body;

  if (!fullname || fullname.trim().length < 2) {
    return res
      .status(400)
      .json({ message: 'Full name must be at least 2 characters' });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { fullname: fullname.trim() },
    { new: true, runValidators: true }
  ).select('-password -refreshToken');

  res.json({
    message: 'Profile updated successfully',
    user,
  });
});

// Upload avatar to Cloudinary and update user
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Validate file type (allow images only)
  if (!req.file.mimetype.startsWith('image/')) {
    return res.status(400).json({ message: 'Only image files are allowed' });
  }

  // Convert buffer to base64 data URI for Cloudinary
  const dataURI = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(dataURI, {
    folder: 'avatars',
    transformation: [
      { width: 200, height: 200, crop: 'fill' },
      { quality: 'auto' },
    ],
    public_id: `${req.user._id}_avatar`,
    overwrite: true,
  });

  // Update user avatar URL in DB
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: result.secure_url },
    { new: true, runValidators: true }
  ).select('-password -refreshToken');

  res.json({
    message: 'Avatar uploaded successfully',
    avatar: result.secure_url,
    user,
  });
});

export { getProfile, updateProfile, uploadAvatar };
