const cron = require("node-cron");
const BoardingSubscription = require("../models/BoardingSubscription");
const Wallet = require("../models/Wallet");
const sendPushNotification = require("../utils/sendPushNotification");
const User = require("../models/user");

// Runs every day at 00:05 AM
cron.schedule("5 0 * * *", async () => {
  console.log("[CRON] Running daily boarding deduction...");

  const activeBookings = await BoardingSubscription.find({ status: "active" });

  for (const booking of activeBookings) {
    try {
      const wallet = await Wallet.findOne({ userId: booking.userId });
      if (!wallet) continue;

      const charge = booking.dailyCharge;

      // Insufficient balance — stop boarding
      if (wallet.balance < charge) {
        booking.status = "inactive";
        await booking.save();

        const user = await User.findById(booking.userId).select("expoPushToken");
        if (user?.expoPushToken) {
          sendPushNotification(
            user.expoPushToken,
            "Boarding Stopped ⚠️",
            "Insufficient wallet balance. Please recharge to resume boarding."
          );
        }
        continue;
      }

      // Deduct
      wallet.balance = parseFloat((wallet.balance - charge).toFixed(2));
      wallet.transactions.push({
        type: "debit",
        amount: charge,
        description: `Daily Boarding Charge (${booking.numberOfPets} pet${booking.numberOfPets > 1 ? "s" : ""})`,
        balanceAfter: wallet.balance,
      });
      await wallet.save();

      // Update days remaining
      booking.daysRemaining = Math.max(0, booking.daysRemaining - 1);
      booking.lastDeductionDate = new Date();
      if (booking.daysRemaining <= 0) booking.status = "inactive";
      await booking.save();

      // Low balance warning (< 2 days cost)
      const user = await User.findById(booking.userId).select("expoPushToken");
      if (user?.expoPushToken && wallet.balance < charge * 2 && booking.status === "active") {
        sendPushNotification(
          user.expoPushToken,
          "Low Wallet Balance 🔔",
          `Only ₹${wallet.balance.toFixed(0)} left. Recharge to keep boarding active.`
        );
      }
    } catch (err) {
      console.error(`[CRON] Error processing booking ${booking._id}:`, err.message);
    }
  }

  console.log(`[CRON] Processed ${activeBookings.length} active boarding(s).`);
});
