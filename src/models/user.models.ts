import mongoose, { Document, Schema } from "mongoose";

export interface Message extends Document {
  content: string;
  createdAt: Date;
}

const messageSchema: Schema<Message> = new Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  otp: string;
  otpExpiry: Date;
  lastVerificationEmailSentAt: Date;
  isVerified: boolean;
  isAccMsg: boolean;
  messages: Message[];
}

const userSchema: Schema<User> = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [
      /([\w\.\-_]+)?\w+@[\w-_]+(\.\w+){1,}/gim,
      "Please provide a valid email address",
    ],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  otp: {
    type: String,
    // required: true,
    default: null,
  },

  otpExpiry: {
    type: Date,
    // required: true,
    default: null,
  },
  lastVerificationEmailSentAt: {
    type: Date,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAccMsg: {
    type: Boolean,
    default: true,
  },
  messages: [messageSchema],
});

const User =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", userSchema);

export default User;
