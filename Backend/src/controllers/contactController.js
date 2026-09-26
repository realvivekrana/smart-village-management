const ContactMessage = require("../models/ContactMessage");

/**
 * @desc    Create a new contact message
 * @route   POST /api/v1/contact
 * @access  Public
 */
const createContactMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required",
      });
    }

    const contactMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || "",
      subject: subject?.trim() || "",
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been submitted successfully",
      data: contactMessage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all contact messages
 * @route   GET /api/v1/contact
 * @access  Private/Admin
 */
const getContactMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single contact message
 * @route   GET /api/v1/contact/:id
 * @access  Private/Admin
 */
const getContactMessageById = async (req, res, next) => {
  try {
    const contactMessage = await ContactMessage.findById(req.params.id);

    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: contactMessage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update contact message status
 * @route   PATCH /api/v1/contact/:id/status
 * @access  Private/Admin
 */
const updateContactMessageStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "new",
      "read",
      "replied",
      "resolved",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(
          ", "
        )}`,
      });
    }

    const contactMessage = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact message status updated successfully",
      data: contactMessage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete contact message
 * @route   DELETE /api/v1/contact/:id
 * @access  Private/Admin
 */
const deleteContactMessage = async (req, res, next) => {
  try {
    const contactMessage = await ContactMessage.findByIdAndDelete(
      req.params.id
    );

    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact message deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createContactMessage,
  getContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
  deleteContactMessage,
};