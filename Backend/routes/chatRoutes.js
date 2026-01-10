const express = require("express");
const multer = require("multer");

const router = express.Router();
const User = require("../models/user");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/",
    "video/",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ];

  if (
    allowedTypes.some((type) => file.mimetype.startsWith(type))
  ) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, 
  fileFilter,
});

router.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  let type = "file";

  if (file.mimetype.startsWith("image/")) type = "image";
  else if (file.mimetype.startsWith("video/")) type = "video";

  res.json({
    url: `/uploads/${file.filename}`,
    type,
    filename: file.originalname,
  });
});

router.get("/messages/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    const chat = await Conversation.findOne({
      $or: [
        { send_id: user1, rev_id: user2 },
        { send_id: user2, rev_id: user1 },
      ],
    });

    if (!chat) return res.status(200).json({ messages: [] });

    res.status(200).json({ messages: chat.Messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/add-friend", async (req, res) => {
  const { user_id, friend_id } = req.body;

  try {
    const me = await User.findOne({ user_id });
    const friend = await User.findOne({ user_id: friend_id });

    if (!friend) {
      return res.status(404).json({ message: "User not found" });
    }

    
    const alreadyAdded = me.friends.some((f) => f.user_id === friend_id);
    if (alreadyAdded) {
      return res.status(400).json({ message: "Friend already added" });
    }


    me.friends.push({
      user_id: friend.user_id,
      user_name: friend.user_name,
    });

    await me.save();

    res.status(200).json({ message: "Friend added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/friends/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne({ user_id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.friends || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;