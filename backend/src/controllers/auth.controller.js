import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import { config } from "../config/config.js";

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

    // Create new user
    const user = await userModel.create({ username, email, password, role });
    const token = generateToken(user);
    res.cookie("token", token);
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        usertype: user.usertype,
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

// logout
// route: POST /api/auth/logout
export const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
};

export const googleCallback = async (req, res) => {
  console.log(req.user);
  const { emails, id, displayName, photos } = req.user;
  const email = emails[0].value;
  const profilePic = photos[0].value;
  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "user already exists", user: existingUser });
    }
    const newUser = await userModel.create({
      username: displayName,
      email,
      picture: profilePic,
      googleId: id,
      usertype: "google",
    });
    const token = generateToken(newUser);
    res.cookie("token", token);
  } catch (error) {
    console.error("Error during Google login:", error);
  }
  res.redirect("http://localhost:5173/");
};
