const { Notification } = require("../models/Notification");

async function listNotifications(req, res) {
  const { role } = req.user;
  const query = { $or: [{ userId: req.user._id }, { role }] };
  const notifications = await Notification.find(query).sort({ timestamp: -1 }).limit(100);
  res.json({ notifications });
}

async function markRead(req, res) {
  const { id } = req.validated.params;
  const n = await Notification.findById(id);
  if (!n) return res.status(404).json({ message: "Notification not found" });
  if (n.userId && String(n.userId) !== String(req.user._id)) return res.status(403).json({ message: "Forbidden" });
  if (n.role && n.role !== req.user.role) return res.status(403).json({ message: "Forbidden" });
  n.isRead = true;
  await n.save();
  res.json({ notification: n });
}

module.exports = { listNotifications, markRead };

