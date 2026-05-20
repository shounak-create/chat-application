import Message from "../models/Message.js";
import User from "../models/User.js";
import Chat from "../models/Chat.js";

export const sendMessage = async (req, res) => {
  try {
    const { content, chatId } = req.body;

    // Validate fields
    if (!content || !chatId) {
      return res.status(400).json({
        message: "Content and chatId are required",
      });
    }

    // Create message object
    let newMessage = {
      sender: req.user._id,
      content,
      chat: chatId,
    };

    // Save message
    let message = await Message.create(newMessage);

    // Populate sender
    message = await message.populate(
      "sender",
      "name email profilePic"
    );

    // Populate chat
    message = await message.populate("chat");

    // Populate chat users
    message = await User.populate(message, {
      path: "chat.users",
      select: "name email profilePic",
    });

    // Update latest message in chat
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message._id,
    });

    res.status(201).json(message);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const fetchMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      chat: req.params.chatId,
    })
      .populate("sender", "name email profilePic")
      .populate("chat");

    res.status(200).json(messages);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};