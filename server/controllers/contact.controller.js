import Contact from "../models/Contact.model.js";
import { sendContactConfirmationEmail } from "../lib/email.js";

// ─── Submit Contact Form ──────────────────────────────────────────────────────
export const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (message.length < 10) {
      return res.status(400).json({ message: "Message is too short." });
    }

    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
      user: req.user?._id || null,
    });

    // Send confirmation email (non-blocking)
    sendContactConfirmationEmail({ to: email, name, subject }).catch(console.error);

    res.status(201).json({
      message: "Your message has been received. We'll get back to you soon!",
      id: contact._id,
    });
  } catch (error) {
    console.error("submitContact error:", error.message);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(". ") });
    }
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// ─── Admin: Get All Contacts ──────────────────────────────────────────────────
export const getAllContacts = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (Number(page) - 1) * Number(limit);

    const [contacts, total] = await Promise.all([
      Contact.find(filter)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Contact.countDocuments(filter),
    ]);

    res.status(200).json({
      contacts,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error("getAllContacts error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Admin: Update Contact Status ─────────────────────────────────────────────
export const updateContactStatus = async (req, res) => {
  try {
    const { status, adminReply } = req.body;
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: "Contact not found." });

    contact.status = status || contact.status;
    if (adminReply) {
      contact.adminReply = adminReply;
      contact.repliedAt = new Date();
    }

    await contact.save();
    res.status(200).json({ message: "Contact updated.", contact });
  } catch (error) {
    console.error("updateContactStatus error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};