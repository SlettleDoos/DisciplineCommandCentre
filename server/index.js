import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB with environment variable
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Example schema (for streaks, goals, affirmations, backgrounds)
const UserSchema = new mongoose.Schema({
  streak: { current: Number, longest: Number },
  goals: {
    daily: [{ text: String, challenge: String }],
    short: [{ text: String, due: String }],
    long: [{ text: String, due: String }],
  },
  affirmations: [String],
  backgrounds: [String], // for image URLs or base64
});

const User = mongoose.model("User", UserSchema);

// ✅ Routes
app.get("/api/user", async (req, res) => {
  try {
    let user = await User.findOne();
    if (!user) {
      // if no user exists, create a default one
      user = new User({
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
    let user = await User.findOne();
    if (!user) user = new User(req.body);
    else Object.assign(user, req.body);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ✅ Serve React frontend (dist folder after build)
app.use(express.static(path.join(__dirname, "../dist")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../dist", "index.html"));
});

// ✅ Render-friendly PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
