const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  username: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-z0-9_-]+$/, 'Username can only contain lowercase letters, numbers, hyphens, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function() {
      // Password is required only if Google auth is not configured
      return !this.googleAuth || !this.googleAuth.uid;
    },
    minlength: [6, 'Password must be at least 6 characters']
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  socialLinks: {
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  articlesCount: {
    type: Number,
    default: 0
  },
  googleAuth: {
    uid: {
      type: String,
      sparse: true // Allows multiple null values but unique non-null values
    },
    email: {
      type: String
    },
    verified: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ name: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'googleAuth.uid': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Skip password hashing if password is not set (Google OAuth users)
  if (!this.password || !this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Generate username if not provided
userSchema.pre('save', async function(next) {
  if (!this.username && this.isNew) {
    try {
      // Generate username from name
      let baseUsername = this.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20);
      
      if (!baseUsername) {
        baseUsername = 'user';
      }
      
      let username = baseUsername;
      let counter = 1;
      
      // Check if username exists and add number if needed
      while (await this.constructor.findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }
      
      this.username = username;
    } catch (error) {
      console.error('Error generating username:', error);
    }
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  // If user has Google auth but no password, they can't login with password
  if (this.googleAuth && this.googleAuth.uid && !this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
