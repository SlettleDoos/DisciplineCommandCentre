import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import Grid from "gridfs-stream";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// ------------------- MONGODB CONNECTION -------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

let gfs;
const conn = mongoose.connection;
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

// ------------------- GRIDFS STORAGE -------------------
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: "uploads",
    };
  },
});
const upload = multer({ storage });

// ------------------- USER SCHEMA -------------------
const UserSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  streak: { current: Number, longest: Number },
  goals: {
    daily: [{ text: String, challenge: String }],
    short: [{ text: String, due: String }],
    long: [{ text: String, due: String }],
  },
  affirmations: [String],
  backgrounds: [
    {
      fileId: String, // MongoDB GridFS file ID
      caption: String,
      date: String,
    },
  ],
  musclePics: [
    {
      fileId: String,
      caption: String,
      date: String,
    },
  ],
  cockPics: [
    {
      fileId: String,
      caption: String,
      date: String,
    },
  ],
});

const User = mongoose.model("User", UserSchema);

// ------------------- API ROUTES -------------------

// GET user data
app.get("/api/data", async (req, res) => {
  try {
    let user = await User.findOne({ _id: "singleton" });
    if (!user) {
      user = new User({
        _id: "singleton",
        streak: { current: 0, longest: 0 },
        goals: { daily: [], short: [], long: [] },
        affirmations: [],
        backgrounds: [],
        musclePics: [],
        cockPics: [],
      });
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT → update user data
app.put("/api/data", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: "singleton" },
      req.body,
      { new: true, upsert: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------- IMAGE UPLOAD -------------------
// Upload a file to GridFS
app.post("/api/upload", upload.single("file"), (req, res) => {
  res.json({ fileId: req.file.id, filename: req.file.filename });
});

// Get an image by file ID
app.get("/api/images/:id", async (req, res) => {
  try {
    const _id = new mongoose.Types.ObjectId(req.params.id);
    const file = await gfs.files.findOne({ _id });
    if (!file) return res.status(404).json({ error: "File not found" });

    const readstream = gfs.createReadStream({ _id });
    res.set("Content-Type", file.contentType || "image/jpeg");
    readstream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------- SERVE FRONTEND -------------------
app.use(express.static(path.join(__dirname, "../dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
