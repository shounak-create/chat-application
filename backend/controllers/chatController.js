import Chat from "../models/Chat.js";

export const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;

    // Validate userId
    if (!userId) {
      return res.status(400).json({
        message: "UserId is required",
      });
    }

    // Check existing chat
    let existingChat = await Chat.find({
      isGroupChat: false,
      users: {
        $all: [req.user._id, userId],
      },
    })
      .populate("users", "-password")
      .populate("latestMessage");

    // If chat exists
    if (existingChat.length > 0) {
      return res.status(200).json(existingChat[0]);
    }

    // Create new chat
    const createdChat = await Chat.create({
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    });

    // Populate users
    const fullChat = await Chat.findById(createdChat._id)
      .populate("users", "-password");

    res.status(201).json(fullChat);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const fetchChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};