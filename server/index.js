import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer"; // ✅ NEW

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" })); // ✅ allow big JSON

// ✅ Multer setup (store in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

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
  backgrounds: [String], // will store base64 images here
  progressPics: [String], // ✅ optional if you want progress pics too
});

const User = mongoose.model("User", UserSchema);

// ✅ GET → fetch current data
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
        progressPics: [],
      });
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ PUT → update existing data
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

// ✅ POST → upload image (background or progress pic)
app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    // Convert to base64
    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

    // Save into user document
    let user = await User.findOne({ _id: "singleton" });
    if (!user) {
      user = new User({ _id: "singleton" });
    }

    // Push into backgrounds (you can change to progressPics if needed)
    user.backgrounds.push(base64Image);
    await user.save();

    res.json({ success: true, image: base64Image, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Serve frontend last
app.use(express.static(path.join(__dirname, "../dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
