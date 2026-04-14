const axios = require("axios");

/**
 * Expo Push Notification bhejo
 * @param {string} expoPushToken - user ka expo push token
 * @param {string} title
 * @param {string} body
 * @param {object} data - extra data (optional)
 */
const sendPushNotification = async (expoPushToken, title, body, data = {}) => {
  if (!expoPushToken || !expoPushToken.startsWith("ExponentPushToken")) return;
  try {
    await axios.post("https://exp.host/--/api/v2/push/send", {
      to: expoPushToken,
      sound: "default",
      title,
      body,
      data,
      priority: "high",
      channelId: "default",
    }, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.log("Push notification failed:", err.message);
  }
};

// Sabhi staff/admin ko ek saath notification bhejo
const broadcastToStaff = async (title, body, data = {}) => {
  try {
    const User = require("../models/user");
    const staffUsers = await User.find(
      { role: { $in: ["staff", "admin"] }, expoPushToken: { $regex: /^ExponentPushToken/ } },
      "expoPushToken"
    );
    const tokens = staffUsers.map(u => u.expoPushToken).filter(Boolean);
    if (!tokens.length) return;
    await axios.post("https://exp.host/--/api/v2/push/send",
      tokens.map(to => ({ to, sound: "default", title, body, data, priority: "high", channelId: "default" })),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.log("Broadcast notification failed:", err.message);
  }
};

sendPushNotification.broadcastToStaff = broadcastToStaff;
module.exports = sendPushNotification;
