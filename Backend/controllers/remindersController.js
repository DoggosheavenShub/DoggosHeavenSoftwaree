const Pet = require("../models/pet");
const nodemailer = require("nodemailer");
const ScheduledVisit = require("../models/scheduledVisit");

const createTransport = () => nodemailer.createTransport({
  service: "gmail",
  secure: true,
  port: 465,
  auth: {
    user: process.env.GMAIL_ACCOUNT,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const sendMail = (to, subject, text, html) => {
  const auth = createTransport();
  return auth.sendMail({ from: process.env.GMAIL_ACCOUNT, to, subject, text, html });
};

exports.sendReminders = async (req, res) => {
  try {
    const { List } = req.body;
    for (const item of List) {
      const subject = "Reminder for Visit";
      const text = `Hii ${item?.ownerName} This is reminder for the visit scheduled for your pet.\nPet name: ${item?.petName || ""}\nSpecies: ${item?.species || ""}\nBreed: ${item?.breed || ""}\nDate: ${item?.date || ""}\nTime: ${item?.time}`;
      await sendMail(item?.email, subject, text).catch(console.log);
    }
    return res.status(200).json({ success: true, message: "Emails sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.sendBirthdayReminders = async (req, res) => {
  try {
    const { list } = req.body;
    for (const item of list) {
      const subject = `Happy Birthday to ${item?.petName}`;
      const text = `Hii ${item?.ownerName}\nJust wanted to wish a very happy birthday to ${item?.petName} 🎂🐾`;
      await sendMail(item?.email, subject, text).catch(console.log);
    }
    return res.status(200).json({ success: true, message: "Birthday emails sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.sendOverdueReminders = async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) return res.json({ success: false, message: "Date is required" });

    const Attendance = require("../models/attendance");
    const attendanceRecord = await Attendance.findOne({ date: new Date(date) }).populate({
      path: "List.petId",
      populate: { path: "owner", select: "name email phone" },
    });

    if (!attendanceRecord || attendanceRecord.List.length === 0)
      return res.status(200).json({ success: true, message: "No scheduled pets found" });

    const absentPets = attendanceRecord.List.filter((item) => item.present === false);
    if (absentPets.length === 0)
      return res.status(200).json({ success: true, message: "All pets are present" });

    for (const item of absentPets) {
      const pet = item.petId;
      if (!pet?.owner?.email) continue;
      const html = `<html><body><p>Hii ${pet?.owner?.name}</p><p>You missed the followup for ${pet?.name} on ${date}.</p><p><strong>Purpose:</strong> ${item?.purpose || "Scheduled Visit"}</p></body></html>`;
      await sendMail(pet.owner.email, "Missed followup", null, html).catch(console.log);
    }

    return res.status(200).json({ success: true, message: `Reminders sent to ${absentPets.length} pet(s)` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getRemindersList = async (req, res) => {
  try {
    const { date } = req.params;
    const TempDate = new Date(date);

    const FollowUpList = await ScheduledVisit.find({ date: TempDate }).populate({
      path: "petId",
      populate: { path: "owner" },
    });

    const birthdayDate = new Date(date);
    const BirthdayList = await Pet.find({
      $expr: {
        $and: [
          { $eq: [{ $month: "$dob" }, birthdayDate.getMonth() + 1] },
          { $eq: [{ $dayOfMonth: "$dob" }, birthdayDate.getDate()] },
        ],
      },
    }).populate({ path: "owner", select: "name phone" });

    const combinedList = [
      ...FollowUpList.map((item) => ({
        petName: item?.petId?.name,
        ownerName: item?.petId?.owner?.name,
        contact: item?.petId?.owner?.phone,
        purpose: item?.purpose,
        scheduledDate: item?.date,
      })),
      ...BirthdayList.map((item) => ({
        petName: item?.name,
        ownerName: item?.owner?.name,
        contact: item?.owner?.phone,
        purpose: "Birthday",
      })),
    ];

    return res.status(200).json({ success: true, List: combinedList, message: "List fetched successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.sendRemindersNew = async (req, res) => {
  try {
    const { date } = req.params;
    const TempDate = new Date(date);

    const FollowUpList = await ScheduledVisit.find({ date: TempDate }).populate({
      path: "petId",
      populate: { path: "owner", select: "email name" },
    });

    for (const [index, item] of FollowUpList.entries()) {
      const text = `Hii ${item?.petId?.owner?.name} This is reminder for the visit.\nPet: ${item?.petId?.name}\nDate: ${date}\nTime: ${item?.time}`;
      await sendMail(item?.petId?.owner?.email, "Reminder for Visit", text).catch(console.log);
    }

    const birthdayDate = new Date(date);
    const BirthdayList = await Pet.find({
      $expr: {
        $and: [
          { $eq: [{ $month: "$dob" }, birthdayDate.getMonth() + 1] },
          { $eq: [{ $dayOfMonth: "$dob" }, birthdayDate.getDate()] },
        ],
      },
    }).populate({ path: "owner", select: "name email" });

    for (const item of BirthdayList) {
      const text = `Hii ${item?.owner?.name}\nHappy Birthday to ${item?.name} 🎂🐾`;
      await sendMail(item?.owner?.email, `Happy Birthday to ${item?.name}`, text).catch(console.log);
    }

    return res.status(200).json({ success: true, message: "Emails sent successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
