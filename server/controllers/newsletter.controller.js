import Newsletter from "../models/Newsletter.model.js";

export const subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (existing.isActive) {
        return res.status(400).json({ message: "You are already subscribed." });
      } else {
        existing.isActive = true;
        existing.unsubscribedAt = null;
        await existing.save();
        return res.status(200).json({ message: "Subscription reactivated." });
      }
    }

    await Newsletter.create({ email: email.toLowerCase() });
    res.status(201).json({ message: "Subscribed successfully!" });
  } catch (error) {
    console.error("subscribe error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

export const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body || req.query;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });
    if (!subscriber) return res.status(404).json({ message: "Subscriber not found." });

    subscriber.isActive = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    res.status(200).json({ message: "Unsubscribed successfully." });
  } catch (error) {
    console.error("unsubscribe error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

export const getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });
    res.status(200).json({ subscribers, total: subscribers.length });
  } catch (error) {
    console.error("getAllSubscribers error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};