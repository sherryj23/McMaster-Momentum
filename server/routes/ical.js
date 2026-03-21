import express from "express";
import { fetchIcal } from "../lib/fetchIcal.js";

const router = express.Router();

router.post("/fetch", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const data = await fetchIcal(url);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;