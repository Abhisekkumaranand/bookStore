import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },
    subject: { type: String, required: true, trim: true },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: [10, "Message too short"],
    },
    status: {
      type: String,
      enum: ["new", "read", "replied", "closed"],
      default: "new",
    },
    adminReply: { type: String, default: "" },
    repliedAt: { type: Date },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

contactSchema.index({ status: 1, createdAt: -1 });

const Contact = mongoose.model("Contact", contactSchema);
export default Contact;