const Message = require("../models/Message");

// GET CONVERSATIONS LIST
exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    // Find all messages where user is sender or receiver
    // We want to group by the "other" user
    
    // Aggregation pipeline to get unique conversation partners
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: currentUserId },
            { receiver: currentUserId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", currentUserId] },
              "$receiver",
              "$sender"
            ]
          },
          lastMessage: { $first: "$$ROOT" }
        }
      },
      {
          $project: {
              _id: 1,
              lastMessage: 1
          }
      }
    ]);

    // Populate user details for each conversation ID
    // Note: Aggregate doesn't support deep populate easily in one go for Mongoose < 6 sometimes? 
    // Mongoose populate on aggregate result works if we use User.populate
    
    const populated = await User.populate(conversations, { path: "_id", select: "name username avatar" });
    
    // Format output
    const formatted = populated.map(c => ({
        user: c._id, 
        lastMessage: c.lastMessage
    })).filter(c => c.user); // Filter out if user deleted

    res.json(formatted);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET CONVERSATION (Messages)
exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE MESSAGE
exports.createMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const newMessage = new Message({
      sender: req.user._id,
      receiver: receiverId,
      text,
    });

    const savedMessage = await newMessage.save();
    res.json(savedMessage);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
