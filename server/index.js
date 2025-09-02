import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Schema
const UserSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // singleton id
  streak: { current: Number, longest: Number },
  goals: {
    daily: [{ text: String, challenge: String }],
    short: [{ text: String, due: String }],
    long: [{ text: String, due: String }],
  },
  affirmations: [String],
  backgrounds: [String],
});

const User = mongoose.model("User", UserSchema);

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer + Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "discipline-app",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});
const upload = multer({ storage });

// Upload route
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ url: req.file.path });
});

// ✅ API routes
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
      });
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/data", async (req, res) => {
  try {
    let user = await User.findOneAndUpdate(
      { _id: "singleton" }, 
      req.body,
      { new: true, upsert: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Serve frontend last (catch-all)
app.use(express.static(path.join(__dirname, "../dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

