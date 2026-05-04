import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      select: false, // Exclude password from query results by default
      required: function () {
        return this.usertype === "local" // Password is required only for local users
      },
    },
    profile: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["admin", "responder"],
      default: "responder",
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    usertype: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

// Pre-save middleware to hash password
userSchema.pre("save", async function () {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) {
    return
  }
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
  } catch (error) {
    console.error("Error hashing password:", error)
  }
})

// Method to compare password during login
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// Remove sensitive fields when converting to JSON / Object
userSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    delete ret.password
    delete ret.__v
    return ret
  },
})

userSchema.set("toObject", {
  transform: function (doc, ret, options) {
    delete ret.password
    delete ret.__v
    return ret
  },
})

const userModel = mongoose.model("user", userSchema)

export default userModel
