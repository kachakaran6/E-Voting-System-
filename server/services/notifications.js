const { Notification } = require("../models/Notification");

async function notifyRole(role, title, message) {
  await Notification.create({ role, title, message });
}

async function notifyUser(userId, title, message) {
  await Notification.create({ userId, title, message });
}

module.exports = { notifyRole, notifyUser };

