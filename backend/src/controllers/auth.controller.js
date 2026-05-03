import jwt from "jsonwebtoken"
import userModel from "../models/user.model.js"
import { config } from "../config/config.js"
import { sendVerificationEmail } from "../services/mail.service.js"

//generat tokens function
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, config.JWT_SECRET, {
    expiresIn: "1h",
  })
}

// register user
// route: POST /api/auth/register
export const register = async (req, res) => {
  const { username, email, password, role } = req.body

  try {
    // Check if user already exists
    const existingUser = await userModel.findOne({
      $or: [{ email }, { username }],
    })
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists", success: false })
    }

    // Create new user with isVerified set to false
    const user = await userModel.create({
      username,
      email,
      password,
      role,
      isVerified: false,
      profile: `${config.BASE_URL}/assets/no_profile.jpg`,
    })

    // Send verification email
    try {
      await sendVerificationEmail(email, username)
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)
      await userModel.deleteOne({ _id: user._id })
      return res.status(500).json({
        message:
          "Failed to send verification email. Please try registering again.",
        success: false,
      })
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
    })
  } catch (error) {
    console.error("Error during registration:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// login
// route: POST /api/auth/login

export const login = async (req, res) => {
  const { email, password, username } = req.body

  try {
    const user = await userModel
      .findOne({
        $or: [{ email }, { username }],
      })
      .select("+password")
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false })
    }
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false })
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
        success: false,
        isVerified: false,
      })
    }

    const token = generateToken(user)
    res.cookie("token", token)
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
    })
  } catch (error) {
    console.error("Error during login:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Verify email
// route: GET /api/auth/verify-email?email=user@example.com
export const verifyEmail = async (req, res) => {
  const { email } = req.query
  const FRONTEND_URL = config.FRONTEND_URL

  try {
    if (!email) {
      return res.redirect(`${FRONTEND_URL}/login?error=missing_email`)
    }

    // Find user by email and set isVerified to true
    const user = await userModel.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true },
    )

    if (!user) {
      return res.redirect(`${FRONTEND_URL}/login?error=user_not_found`)
    }

    return res.redirect(`${FRONTEND_URL}/login?verified=true`)
  } catch (error) {
    console.error("Error during email verification:", error)
    return res.redirect(`${FRONTEND_URL}/login?error=server_error`)
  }
}

// logout
// route: POST /api/auth/logout
export const logout = (req, res) => {
  res.clearCookie("token")
  res.status(200).json({ message: "Logout successful", success: true })
}

// get current user
// route: GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password")
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
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
    })
  } catch (error) {
    console.error("Error in getMe:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
}

export const verifyEmailForAssignment = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await userModel.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ success: false, message: "Email does not exist in the system" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ success: false, message: "Admins cannot be assigned to projects" });
    }

    return res.status(200).json({
      success: true,
      user: {
        email: user.email,
        username: user.username,
      }
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Verify that an email belongs to a user who is a member of a specific project.
 * Used by the Create Incident form to validate responder assignments.
 *
 * The caller can assign themselves even if they are the leader — no role gate,
 * only project membership is checked.
 *
 * Query: GET /api/auth/verify-responder-email/:email?projectId=<id>
 */
export const verifyResponderEmail = async (req, res) => {
  try {
    const { email, projectId } = req.query;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    if (!projectId) {
      return res.status(400).json({ success: false, message: "projectId is required" });
    }

    // Single indexed lookup — O(log N)
    const user = await userModel.findOne({ email: email.toLowerCase() }).select("_id username email role");

    if (!user) {
      return res.status(404).json({ success: false, message: "No user found with this email" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ success: false, message: "Admins cannot be assigned as responders" });
    }

    // Import project model inline to avoid circular dependency at module level
    const projectModel = (await import("../models/project.model.js")).default;

    const project = await projectModel.findById(projectId).select("members");
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Check if this user is a member (any role — member or leader) of the project
    const isMember = project.members.some(
      (m) => m.user.toString() === user._id.toString()
    );

    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: "This user is not a member of the project",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Error verifying responder email:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const googleCallback = async (req, res) => {
  const FRONTEND_URL = config.FRONTEND_URL
  const { emails, id, displayName, photos } = req.user
  const email = emails[0].value
  const profilePic = photos[0].value

  try {
    // Get role from session (set during /google route)
    // If no role in session, default to 'member'
    const userRole = req.session.userRole || "member"

    // Check if user already exists
    let user = await userModel.findOne({ email })

    if (!user) {
      // New user - create with the role from session
      user = await userModel.create({
        username: displayName,
        email,
        profile: profilePic,
        googleId: id,
        usertype: "google",
        role: userRole, // Assign role from invite/selection
        isVerified: true,
      })
      console.log(`✓ New user created: ${email} with role: ${userRole}`)
    } else {
      console.log(`✓ Existing user logged in: ${email} (role: ${user.role})`)
    }

    // Generate JWT token (includes user ID and role)
    const token = generateToken(user)
    res.cookie("token", token)

    // Redirect to frontend with token and role
    // Frontend will use these to determine dashboard destination
    const redirectUrl = `${FRONTEND_URL}/auth-success?token=${token}&role=${user.role}`
    return res.redirect(redirectUrl)
  } catch (error) {
    console.error("Error during Google login:", error)
    return res.redirect(`${FRONTEND_URL}/login?error=server_error`)
  }
}

export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select("-password")
    res.status(200).json({ success: true, users })
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
}
