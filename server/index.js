import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Serve frontend (dist folder)
app.use(express.static(path.join(__dirname, "../dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Schema
const UserSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // force singleton id
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

// ✅ API routes
app.get("/api/user", async (req, res) => {
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

app.post("/api/user", async (req, res) => {
  try {
    let user = await User.findOneAndUpdate(
      { _id: "singleton" },   // always target the same doc
      req.body,
      { new: true, upsert: true } // create if none exists
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
