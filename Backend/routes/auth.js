const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');
const {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate
} = require('../middleware/validation');
const {
  generateToken,
  formatErrorResponse,
  formatSuccessResponse
} = require('../utils/helpers');
const { verifyIdToken, isFirebaseConfigured } = require('../config/firebase');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateUserRegistration, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json(
        formatErrorResponse('User with this email already exists', 400)
      );
    }

    // Create new user
    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json(
      formatSuccessResponse('User registered successfully', {
        user,
        token
      }, null, req.timezone)
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json(
      formatErrorResponse('Server error during registration')
    );
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateUserLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json(
        formatErrorResponse('Invalid credentials', 400)
      );
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json(
        formatErrorResponse('Invalid credentials', 400)
      );
    }

    // Generate token
    const token = generateToken(user._id);

    res.json(
      formatSuccessResponse('Login successful', {
        user,
        token
      }, null, req.timezone)
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(
      formatErrorResponse('Server error during login')
    );
  }
});

// @route   POST /api/auth/google
// @desc    Google OAuth login/register
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { idToken, user: firebaseUser } = req.body;

    // Check if Firebase is configured
    if (!isFirebaseConfigured()) {
      return res.status(500).json(
        formatErrorResponse('Google OAuth is not configured on this server', 500)
      );
    }

    // Validate request body
    if (!idToken || !firebaseUser) {
      return res.status(400).json(
        formatErrorResponse('ID token and user data are required', 400)
      );
    }

    // Verify Firebase ID token
    let decodedToken;
    try {
      decodedToken = await verifyIdToken(idToken);
    } catch (error) {
      console.error('Firebase token verification error:', error);
      return res.status(401).json(
        formatErrorResponse('Invalid Google authentication token', 401)
      );
    }

    // Extract user data from Firebase token and request
    const { uid, email, email_verified } = decodedToken;
    const { displayName, photoURL } = firebaseUser;

    // Check if email is verified
    if (!email_verified) {
      return res.status(400).json(
        formatErrorResponse('Email not verified with Google', 400)
      );
    }

    // Check if user already exists
    let user = await User.findOne({ 
      $or: [
        { email: email },
        { 'googleAuth.uid': uid }
      ]
    });

    if (user) {
      // Update existing user with Google auth info if not already set
      if (!user.googleAuth || !user.googleAuth.uid) {
        user.googleAuth = {
          uid: uid,
          email: email,
          verified: email_verified
        };
        
        // Update avatar if user doesn't have one and Google provides one
        if (!user.avatar && photoURL) {
          user.avatar = photoURL;
        }
        
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        name: displayName || email.split('@')[0],
        email: email,
        avatar: photoURL || undefined,
        googleAuth: {
          uid: uid,
          email: email,
          verified: email_verified
        },
        // For Google OAuth users, we don't store a password
        // They can only login through Google
        password: undefined
      });

      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json(
      formatSuccessResponse('Google authentication successful', {
        user,
        token
      }, null, req.timezone)
    );
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json(
      formatErrorResponse('Server error during Google authentication')
    );
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('followers', 'name email avatar')
      .populate('following', 'name email avatar');

    res.json(
      formatSuccessResponse('User data retrieved', user, null, req.timezone)
    );
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json(
      formatErrorResponse('Server error')
    );
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, validateUserUpdate, async (req, res) => {
  try {
    const { name, bio, socialLinks } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (socialLinks) updateData.socialLinks = socialLinks;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(
      formatSuccessResponse('Profile updated successfully', user, null, req.timezone)
    );
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json(
      formatErrorResponse('Server error during profile update')
    );
  }
});

// @route   POST /api/auth/upload-avatar
// @desc    Upload user avatar
// @access  Private
router.post('/upload-avatar', auth, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(
        formatErrorResponse('No file uploaded', 400)
      );
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: req.file.path },
      { new: true }
    );

    res.json(
      formatSuccessResponse('Avatar uploaded successfully', {
        avatar: user.avatar
      }, null, req.timezone)
    );
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json(
      formatErrorResponse('Server error during avatar upload')
    );
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json(
        formatErrorResponse('Current password and new password are required', 400)
      );
    }

    if (newPassword.length < 6) {
      return res.status(400).json(
        formatErrorResponse('New password must be at least 6 characters long', 400)
      );
    }

    const user = await User.findById(req.user.id);
    
    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json(
        formatErrorResponse('Current password is incorrect', 400)
      );
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json(
      formatSuccessResponse('Password changed successfully')
    );
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json(
      formatErrorResponse('Server error during password change')
    );
  }
});

module.exports = router;
