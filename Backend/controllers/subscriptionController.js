const SubscriptionPlan = require("../models/subscriptionPlan");
const Subscription = require("../models/subscription");
const Visit = require("../models/Visit");
const mongoose = require("mongoose");

exports.buySubscription = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { petId, planId, visitType } = req.body;

    if (!petId || !planId) {
      return res.status(400).json({
        success: false,
        message: "Please provide all details",
      });
    }

    const subscription = await Subscription.findOne({ petId, planId });
    const PlanDetails = await SubscriptionPlan.findOne({ _id: planId });

    let days = PlanDetails?.duration || 0;
    
    console.log(PlanDetails);
    
    if (!subscription) {
      const newSubscription = new Subscription({
        planId,
        petId,
        daysLeft: PlanDetails?.duration || null,
        numberOfGroomings: PlanDetails?.numberOfGroomings || null,
        firstPaymentDate: new Date(),
        lastPaymentDate: new Date(),
      });
      await newSubscription.save({ session });
    } else {
      if (PlanDetails?.duration) subscription.daysLeft += days;
      else subscription.numberOfGroomings += PlanDetails?.numberOfGroomings;
      subscription.lastPaymentDate = new Date();
      await subscription.save({ session });
    }

    const details = {};
    (details.purpose = subscription
      ? "Renew Subscription"
      : "Buy Subscription"),
      (details.subscriptionPlan = PlanDetails.subscriptionType);
    details.price = PlanDetails.price;
    price = PlanDetails.price;

    const visit = new Visit({
      pet: petId,
      visitType,
      details,
    });

    await visit.save({ session });

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Subscription bought successfully",
    });
  } catch (error) {
    console.log("Error in buy subscription controller", error.message);
    await session.abortTransaction();
    res.status(500).json({ success: false, message: "Internal Server Error" });
  } finally {
    session.endSession();
  }
};

exports.getSubscriptionDetails = async (req, res) => {
  try {
    const { petId, visitType } = req.query;

    if (!petId) {
      return res.status(400).json({
        success: false,
        message: "Pet must be selected to get subscription details",
      });
    }

    let subscriptions = await Subscription.find({
      petId: petId,
    }).populate([
      {
        path: "planId",
      },
      {
        path: "petId",
        populate: {
          path: "owner", // Populate owner within petId
          select: "name phone", // Only include name and phone fields from User
        },
      },
    ])
    
    subscriptions=subscriptions.filter((sub)=>sub.planId?.subscriptionType?.toString() === visitType.toString());

    return res.status(200).json({
      success: true,
      message: "Subscription details fetched successfully",
      subscription: subscriptions.length>0?subscriptions[0]:null,
    });

  } catch (error) {
    console.log("Error in get subscription details controller", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getAllSubscriptions = async (req, res) => {
  try {
    const subscriptionPlans = await SubscriptionPlan.find({}).populate({
      path: "subscriptionType",
      select: "purpose",
    });
    return res.status(200).json({
      success: true,
      message: "Plans fetched successfully",
      subscriptionPlans,
    });
  } catch (error) {
    console.log("Error in getallsubscription controller", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
