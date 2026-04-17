import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';

// Helper to set cookie
const sendTokenResponse = async (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshTokenString = generateRefreshToken();

  // Save refresh token to db
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await RefreshToken.create({
    token: refreshTokenString,
    user: user._id,
    expiresAt
  });

  const options = {
    expires: expiresAt,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res
    .status(statusCode)
    .cookie('refreshToken', refreshTokenString, options)
    .json({
      success: true,
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      return next(new Error('Email already registered'));
    }

    const user = await User.create({
      name,
      email,
      password // password will be hashed in pre-save hook
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      return next(new Error('Please provide an email and password'));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401);
      return next(new Error('Invalid credentials'));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      return next(new Error('Invalid credentials'));
    }

    // Check if active
    if (user.status === 'inactive') {
      res.status(403);
      return next(new Error('Account is deactivated'));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log user out / clear cookie
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    // Optionally revoke the refresh token in the DB
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await RefreshToken.findOneAndDelete({ token: refreshToken });
    }

    res.cookie('refreshToken', 'none', {
      expires: new Date(Date.now() + 10 * 1000), // 10 sec
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh token
// @route   POST /api/v1/auth/refresh
// @access  Public
export const refresh = async (req, res, next) => {
  try {
    const refreshTokenString = req.cookies.refreshToken;

    if (!refreshTokenString) {
      res.status(401);
      return next(new Error('Not authorized, no refresh token'));
    }

    const tokenDoc = await RefreshToken.findOne({ token: refreshTokenString }).populate('user');

    if (!tokenDoc || tokenDoc.isRevoked || tokenDoc.expiresAt < new Date()) {
      if (tokenDoc) await tokenDoc.deleteOne();
      res.status(401);
      return next(new Error('Token is not valid or expired'));
    }

    // Generate new access token
    const accessToken = generateAccessToken(tokenDoc.user._id);

    res.status(200).json({
      success: true,
      token: accessToken
    });
  } catch (error) {
    next(error);
  }
};
