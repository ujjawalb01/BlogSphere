import Message from "../models/Message.js";
import User from "../models/User.js";

const getConversations = async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            {
              sender: req.user._id
            },
            {
              receiver: req.user._id
            }
          ]
        }
      },

      {
        $sort: {
          createdAt: -1
        }
      },

      {
        $group: {
          _id: {
            $cond: [
              {
                $eq: [
                  "$sender",
                  req.user._id
                ]
              },
              "$receiver",
              "$sender"
            ]
          },

          lastMessage: {
            $first: "$$ROOT"
          }
        }
      }
    ]);

    await User.populate(
      conversations,
      {
        path: "_id",
        select: "name username avatar"
      }
    );

    const result = conversations
      .filter((conversation) => conversation._id)
      .map((conversation) => ({
        user: conversation._id,
        lastMessage: conversation.lastMessage
      }));

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false
    });

    return res.json({
      count
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        {
          sender: req.user._id,
          receiver: req.params.userId
        },
        {
          sender: req.params.userId,
          receiver: req.user._id
        }
      ]
    }).sort({
      createdAt: 1
    });

    return res.json(messages);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

const markMessagesRead = async (req, res) => {
  try {
    await Message.updateMany(
      {
        sender: req.body.userId,
        receiver: req.user._id,
        isRead: false
      },
      {
        $set: {
          isRead: true
        }
      }
    );

    return res.json({
      message: "Messages marked as read"
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

const createMessage = async (req, res) => {
  try {
    const {
      receiver,
      text
    } = req.body;

    const message = new Message({
      sender: req.user._id,
      receiver,
      text
    });

    await message.save();

    // Send realtime message
    if (global.io) {
      global.io
        .to(receiver.toString())
        .emit("newMessage", message);
    }

    return res.json(message);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

export default {
  getConversations,
  getUnreadCount,
  getMessages,
  markMessagesRead,
  createMessage
};