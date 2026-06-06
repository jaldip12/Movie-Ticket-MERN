import mongoose from "mongoose";
import { asyncHandler } from "../utils/asynchandler.js";
import User from "../models/user.model.js";
import { ApiResponse } from "../utils/apiresponce.js";
import { ApiError } from "../utils/apierror.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const isProd = () => process.env.NODE_ENV === "production";

const cookieOptions = () => ({
  httpOnly: true,
  secure: isProd(),
  sameSite: isProd() ? "none" : "lax",
  maxAge: 15 * 24 * 60 * 60 * 1000,
});

const DEFAULT_NOTIFICATION_PREFERENCES = {
  emailOnBooking: true,
  emailOnReminder: true,
  emailOnNewRelease: false,
  promotionalEmails: false,
};

const publicUser = (user) => {
  const prefs = user.notificationPreferences || {};
  return {
    _id: user._id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    number: user.number,
    gender: user.gender,
    city: user.city,
    role: user.role,
    avatar: user.avatar || "",
    notificationPreferences: {
      // Mongoose can hand us a sub-document here; fall back to defaults so
      // the client always gets all four flags even on legacy users.
      emailOnBooking:
        prefs.emailOnBooking ?? DEFAULT_NOTIFICATION_PREFERENCES.emailOnBooking,
      emailOnReminder:
        prefs.emailOnReminder ?? DEFAULT_NOTIFICATION_PREFERENCES.emailOnReminder,
      emailOnNewRelease:
        prefs.emailOnNewRelease ??
        DEFAULT_NOTIFICATION_PREFERENCES.emailOnNewRelease,
      promotionalEmails:
        prefs.promotionalEmails ??
        DEFAULT_NOTIFICATION_PREFERENCES.promotionalEmails,
    },
  };
};

// RFC 5322-lite. Good enough to reject "a@b" / "no-domain" / missing-tld
// without false-positives on legitimate addresses. Final-truth check happens
// on the verification email.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Minimum 6 chars + at least one letter and one digit. Industry-typical
// middle ground that survives a credential-stuffing attempt without
// frustrating users with mandatory symbols.
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

// 7-15 digits, allowing an optional leading +. Matches E.164 loosely without
// pinning to a single country.
const PHONE_RE = /^\+?\d{7,15}$/;

const registeruser = asyncHandler(async (req, res) => {
  const { firstname, lastname, email, password, number, gender, city } =
    req.body;

  if (!firstname || !lastname || !email || !password || !number || !gender || !city) {
    throw new ApiError(400, "Please fill all the fields");
  }

  if (!EMAIL_RE.test(String(email).trim())) {
    throw new ApiError(400, "Please enter a valid email address");
  }

  if (!PASSWORD_RE.test(password)) {
    throw new ApiError(
      400,
      "Password must be at least 6 characters and contain a letter and a number"
    );
  }

  if (!PHONE_RE.test(String(number).replace(/\s/g, ""))) {
    throw new ApiError(400, "Please enter a valid phone number");
  }

  const normalisedEmail = String(email).trim().toLowerCase();
  const existing = await User.findOne({ email: normalisedEmail });
  if (existing) {
    throw new ApiError(409, "Email already in use");
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    firstname: String(firstname).trim(),
    lastname: String(lastname).trim(),
    email: normalisedEmail,
    password: hashed,
    number: String(number).trim(),
    gender,
    city: String(city).trim(),
    role: "user",
  });

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15d" }
  );
  res.cookie("token", token, cookieOptions());

  return res
    .status(201)
    .json(new ApiResponse(201, publicUser(user), "User registered successfully"));
});

const getUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.isActive === false) {
    throw new ApiError(403, "Account is deactivated");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15d" }
  );

  res.cookie("token", token, cookieOptions());

  return res
    .status(200)
    .json(new ApiResponse(200, publicUser(user), "Login successful"));
});

const requestOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  if (!phone || typeof phone !== "string") {
    throw new ApiError(400, "Phone is required");
  }

  const trimmed = phone.trim();
  if (!/^\d{10}$/.test(trimmed)) {
    throw new ApiError(400, "Phone must be a 10-digit number");
  }

  // Dev mode no-op: do not leak whether the phone exists.
  return res
    .status(200)
    .json(new ApiResponse(200, null, "OTP sent"));
});

const loginWithOtp = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || typeof phone !== "string") {
    throw new ApiError(400, "Phone is required");
  }
  if (!otp || typeof otp !== "string") {
    throw new ApiError(400, "OTP is required");
  }

  const trimmedPhone = phone.trim();
  if (!/^\d{10}$/.test(trimmedPhone)) {
    throw new ApiError(400, "Phone must be a 10-digit number");
  }

  // Dev/staging convenience: literal `123456` is accepted as the OTP for any phone.
  // PRODUCTION refuses this — in prod, OTP verification must go through the real
  // SMS provider (MSG91 / Twilio Verify). This gate prevents an accidental
  // ship-with-test-OTP from becoming an account-takeover vector.
  if (process.env.NODE_ENV === "production") {
    throw new ApiError(
      501,
      "Phone OTP login is not available in production yet. Use email login."
    );
  }
  if (otp !== "123456") {
    throw new ApiError(401, "Invalid OTP");
  }

  const user = await User.findOne({ number: trimmedPhone });
  if (!user || user.isActive === false) {
    throw new ApiError(401, "Phone not registered");
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15d" }
  );

  res.cookie("token", token, cookieOptions());

  return res
    .status(200)
    .json(new ApiResponse(200, publicUser(user), "Login successful"));
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd(),
    sameSite: isProd() ? "none" : "lax",
  });
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Logged out successfully"));
});

const me = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Not authenticated");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, publicUser(req.user), "Authenticated"));
});

const adminListUsers = asyncHandler(async (req, res) => {
  const { search, role, isActive } = req.query;

  const filter = {};

  if (role) {
    if (!["user", "admin"].includes(role)) {
      throw new ApiError(400, "Invalid role filter");
    }
    filter.role = role;
  }

  if (isActive === "true") filter.isActive = true;
  else if (isActive === "false") filter.isActive = false;

  if (search && search.trim()) {
    const term = search.trim();
    const regex = { $regex: term, $options: "i" };
    filter.$or = [
      { firstname: regex },
      { lastname: regex },
      { email: regex },
      { number: regex },
      { city: regex },
    ];
  }

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  const pageCount = Math.ceil(total / limit) || 0;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { items, total, page, pageCount },
        "Users fetched successfully"
      )
    );
});

const adminUpdateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid user id");
  }

  const { role, isActive } = req.body;
  const update = {};

  if (role !== undefined) {
    if (!["user", "admin"].includes(role)) {
      throw new ApiError(400, "Invalid role");
    }
    update.role = role;
  }

  if (isActive !== undefined) {
    if (typeof isActive !== "boolean") {
      throw new ApiError(400, "isActive must be a boolean");
    }
    update.isActive = isActive;
  }

  if (Object.keys(update).length === 0) {
    throw new ApiError(400, "Nothing to update");
  }

  const user = await User.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User updated successfully"));
});

const ALLOWED_GENDERS = ["male", "female", "other"];

const updateMe = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Not authenticated");
  }

  const allowed = ["firstname", "lastname", "number", "gender", "city", "avatar"];
  const update = {};

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      const val = req.body[key];
      if (typeof val !== "string") {
        throw new ApiError(400, `${key} must be a string`);
      }
      const trimmed = val.trim();
      update[key] = trimmed;
    }
  }

  if (Object.keys(update).length === 0) {
    throw new ApiError(400, "Nothing to update");
  }

  if (update.gender !== undefined && update.gender !== "") {
    if (!ALLOWED_GENDERS.includes(update.gender)) {
      throw new ApiError(400, "Invalid gender");
    }
  }

  if (update.number !== undefined && update.number !== "") {
    if (!/^\d{10}$/.test(update.number)) {
      throw new ApiError(400, "Phone must be a 10-digit number");
    }
  }

  if (update.firstname !== undefined && update.firstname.length === 0) {
    throw new ApiError(400, "First name cannot be empty");
  }
  if (update.lastname !== undefined && update.lastname.length === 0) {
    throw new ApiError(400, "Last name cannot be empty");
  }
  if (update.city !== undefined && update.city.length === 0) {
    throw new ApiError(400, "City cannot be empty");
  }

  const user = await User.findByIdAndUpdate(req.user._id, update, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, publicUser(user), "Profile updated successfully"));
});

const changeMyPassword = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Not authenticated");
  }

  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || typeof currentPassword !== "string") {
    throw new ApiError(400, "Current password is required");
  }
  if (!newPassword || typeof newPassword !== "string") {
    throw new ApiError(400, "New password is required");
  }
  if (newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const matches = await bcrypt.compare(currentPassword, user.password);
  if (!matches) {
    throw new ApiError(401, "Current password incorrect");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password changed successfully"));
});

const deleteMe = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Not authenticated");
  }

  const { confirmText } = req.body || {};
  if (confirmText !== "DELETE") {
    throw new ApiError(400, 'Type "DELETE" to confirm account deletion');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const randomPassword = await bcrypt.hash(
    `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    10
  );

  user.isActive = false;
  user.deletedAt = new Date();
  user.email = `deleted-${user._id}@deleted.local`;
  user.firstname = "Deleted";
  user.lastname = "User";
  user.number = "";
  user.gender = "other";
  user.city = "";
  user.avatar = "";
  user.password = randomPassword;

  await user.save({ validateBeforeSave: false });

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd(),
    sameSite: isProd() ? "none" : "lax",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Account deleted successfully"));
});

const NOTIFICATION_PREF_KEYS = [
  "emailOnBooking",
  "emailOnReminder",
  "emailOnNewRelease",
  "promotionalEmails",
];

const updateNotificationPreferences = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Not authenticated");
  }

  const body = req.body || {};
  const update = {};

  for (const key of NOTIFICATION_PREF_KEYS) {
    if (body[key] === undefined) continue;
    if (typeof body[key] !== "boolean") {
      throw new ApiError(400, `${key} must be a boolean`);
    }
    // Use dot-notation so we patch a single field on the sub-doc instead of
    // overwriting the whole object — this keeps unspecified prefs intact.
    update[`notificationPreferences.${key}`] = body[key];
  }

  if (Object.keys(update).length === 0) {
    throw new ApiError(400, "Nothing to update");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: update },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        publicUser(user),
        "Notification preferences updated"
      )
    );
});

export {
  registeruser,
  getUser,
  logout,
  me,
  adminListUsers,
  adminUpdateUser,
  requestOtp,
  loginWithOtp,
  updateMe,
  changeMyPassword,
  deleteMe,
  updateNotificationPreferences,
};
