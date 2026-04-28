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
    res.status(201).json({ message: "User registered successfully", user });
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
    const user = await userModel.findOne({
      $or: [{ email }, { username }],
    });
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
    res.json({ message: "Login successful", user });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// logout
// route: POST /api/auth/logout
export const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout successful" });
};
