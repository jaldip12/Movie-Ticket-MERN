import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    firstname: { type: String, required: true, trim: true },
    lastname: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    number: { type: String, required: true, trim: true },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
    },
    city: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: { type: Boolean, default: true },
    avatar: { type: String, default: "" },
    deletedAt: { type: Date, default: null },
    notificationPreferences: {
      type: new Schema(
        {
          emailOnBooking: { type: Boolean, default: true },
          emailOnReminder: { type: Boolean, default: true },
          emailOnNewRelease: { type: Boolean, default: false },
          promotionalEmails: { type: Boolean, default: false },
        },
        { _id: false }
      ),
      default: () => ({}),
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

export default User;
