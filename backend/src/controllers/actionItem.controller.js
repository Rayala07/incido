import ActionItem from "../models/actionItem.js"

export const getOpenActionItemCount = async (req, res) => {
  try {
    const count = await ActionItem.countDocuments({ status: "open" })

    res.json({ success: true, count })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to load action item count" })
  }
}
