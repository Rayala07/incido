import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import { config } from "../config/config.js";
import { sendVerificationEmail } from "../services/mail.service.js";

//generat tokens function
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, config.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// register user
// route: POST /api/auth/register
export const register = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await userModel.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists", success: false });
    }

    // Create new user with isVerified set to false
    const user = await userModel.create({
      username,
      email,
      password,
      role,
      isVerified: false,
      profile: `${config.BASE_URL}/assets/no_profile.jpg`,
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, username);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      await userModel.deleteOne({ _id: user._id });
      return res.status(500).json({
        message:
          "Failed to send verification email. Please try registering again.",
        success: false,
      });
    }

    res.status(201).json({
      message:
        "User registered successfully. Please check your email to verify your account.",
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// login
// route: POST /api/auth/login

export const login = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const user = await userModel
      .findOne({
        $or: [{ email }, { username }],
      })
      .select("+password");
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
        success: false,
        isVerified: false,
      });
    }

    const token = generateToken(user);
    res.cookie("token", token);
    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        usertype: user.usertype,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Verify email
// route: GET /api/auth/verify-email?email=user@example.com
export const verifyEmail = async (req, res) => {
  const { email } = req.query;
  const FRONTEND_URL = config.FRONTEND_URL;

  try {
    if (!email) {
      return res.redirect(`${FRONTEND_URL}/login?error=missing_email`);
    }

    // Find user by email and set isVerified to true
    const user = await userModel.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true },
    );

    if (!user) {
      return res.redirect(`${FRONTEND_URL}/login?error=user_not_found`);
    }

    return res.redirect(`${FRONTEND_URL}/login?verified=true`);
  } catch (error) {
    console.error("Error during email verification:", error);
    return res.redirect(`${FRONTEND_URL}/login?error=server_error`);
  }
};

// logout
// route: POST /api/auth/logout
export const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful", success: true });
};

// get current user
// route: GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        usertype: user.usertype,
        profile: user.profile,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in getMe:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const googleCallback = async (req, res) => {
  const FRONTEND_URL = config.FRONTEND_URL;
  const { emails, id, displayName, photos } = req.user;
  const email = emails[0].value;
  const profilePic = photos[0].value;
  
  try {
    let user = await userModel.findOne({ email });
    
    if (!user) {
      user = await userModel.create({
        username: displayName,
        email,
        profile: profilePic,
        googleId: id,
        usertype: "google",
        isVerified: true,
      });
    }
    
    const token = generateToken(user);
    res.cookie("token", token);
    return res.redirect(`${FRONTEND_URL}/dashboard`);
  } catch (error) {
    console.error("Error during Google login:", error);
    return res.redirect(`${FRONTEND_URL}/login?error=server_error`);
  }
};
