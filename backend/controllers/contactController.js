const ContactMessage = require('../models/ContactMessage');

const createContactMessage = async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !name.trim())    return res.status(400).json({ message: 'Name is required.' });
  if (!email || !email.trim())  return res.status(400).json({ message: 'Email is required.' });
  if (!message || !message.trim()) return res.status(400).json({ message: 'Message is required.' });

  try {
    const doc = new ContactMessage({ name, email, message });
    const saved = await doc.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createContactMessage, getContactMessages };
