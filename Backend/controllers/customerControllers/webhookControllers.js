
const SubscriptionPlan = require("../../models/subscriptionPlan");
const Subscription = require("../../models/subscription");
const crypto=require("crypto")

const Pet = require('../../models/pet');


async function handleSubscriptionPayment(planId, petId) {
    try {
        // Business logic here (e.g., DB update, API calls)
        const subscription = await Subscription.findOne({ petId, planId });

        const PlanDetails = await SubscriptionPlan.findOne({ _id: planId });

        let days = PlanDetails?.duration || 0;


        if (!subscription) {
            const newSubscription = new Subscription({
                planId,
                petId,
                daysLeft: PlanDetails?.duration || null,
                numberOfGroomings: PlanDetails?.numberOfGroomings || null,
                firstPaymentDate: new Date(),
                lastPaymentDate: new Date(),
            });
            await newSubscription.save();
        } else {
            if (PlanDetails?.duration) subscription.daysLeft += days;
            else subscription.numberOfGroomings += PlanDetails?.numberOfGroomings;
            subscription.lastPaymentDate = new Date();
            subscription.active = true
            await subscription.save();
        }

        return {
            success: true,
            message: "Subscription bought successfully",
        };

    } catch (error) {
        console.log("Error in handleSubscriptionPayment", error.message);
        return { success: false, message: "Internal Server Error" };
    }
}

exports.customerPaymentWebhook = async (req, res) => {

    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const receivedSignature = req.headers["x-razorpay-signature"];
        const generatedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(req.body) // 👈 raw body used here
            .digest("hex");

        let data = {
            success: false
        }

        if (generatedSignature === receivedSignature) {
            const payload = JSON.parse(req.body.toString());

            if (payload.event === "payment.captured") {
                const payment = payload.payload.payment.entity;
                const { email, planId, petId, purpose } = payment?.notes;

                switch (purpose) {
                    case "subscription":
                        data = await handleSubscriptionPayment(planId, petId);
                        break;

                    case "appointment":
                        await handleAppointmentPayment(payment);
                        break;

                    case "service":
                        await handleServicePayment(payment);
                        break;

                    default:
                        console.log("Unknown payment purpose");
                }


                // TODO: mark order as paid, send email, etc.
                return res
                    .json(data);
            }

            console.log("Unhandled event");
        } else {
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (error) {
        console.error("Error in Customer Payment Webhook", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};