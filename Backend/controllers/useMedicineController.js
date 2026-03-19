const Inventory    = require("../models/inventory");
const UsageLog     = require("../models/usageLog");
const StockHistory = require("../models/stockHistory");

exports.useMedicine = async (req, res) => {
  try {
    const { inventoryId, medicineName, quantityUsed, petName, bookingId, usedBy, caseType, paymentStatus, notes } = req.body;

    if (!inventoryId || !medicineName || !quantityUsed || !petName || !bookingId || !usedBy || !caseType) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (!["Customer", "NGO"].includes(caseType)) {
      return res.status(400).json({ success: false, message: "caseType must be 'Customer' or 'NGO'" });
    }

    const item = await Inventory.findById(inventoryId);
    if (!item) return res.status(404).json({ success: false, message: "Inventory item not found" });

    if (item.stock < quantityUsed) {
      return res.status(400).json({ success: false, message: `Insufficient stock. Available: ${item.stock}` });
    }

    const qty = Number(quantityUsed);
    const costPrice   = parseFloat((item.unitCostPrice * qty).toFixed(2));
    const unitSell    = caseType === "NGO" ? item.unitMinRetailPriceNGO : item.unitMaxRetailPriceCustomer;
    const sellPrice   = parseFloat((unitSell * qty).toFixed(2));
    const totalAmount = sellPrice;
    const profit      = parseFloat((sellPrice - costPrice).toFixed(2));

    const previousStock = item.stock;
    const currentStock  = previousStock - qty;

    item.stock = currentStock;
    await item.save();

    await UsageLog.create({
      inventoryId, medicineName, quantityUsed: qty,
      petName, bookingId, usedBy, caseType,
      costPrice, sellPrice, totalAmount, profit,
      paymentStatus: paymentStatus || "Pending",
      notes,
    });

    await StockHistory.create({
      inventoryId,
      itemName: item.itemName,
      actionType: "Used",
      quantity: qty,
      previousStock,
      currentStock,
      staff: usedBy,
      notes,
    });

    return res.status(200).json({
      success: true,
      message: "Medicine usage recorded successfully",
      currentStock,
    });
  } catch (error) {
    console.error("Error in useMedicine:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getUsageLogs = async (req, res) => {
  try {
    const logs = await UsageLog.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getRevenue = async (req, res) => {
  try {
    const { year, month, day, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (year || month || day) {
      const y = year  ? parseInt(year)  : null;
      const m = month ? parseInt(month) : null;
      const d = day   ? parseInt(day)   : null;

      let start, end;

      if (y && m && d) {
        start = new Date(y, m - 1, d, 0, 0, 0, 0);
        end   = new Date(y, m - 1, d, 23, 59, 59, 999);
      } else if (y && m) {
        start = new Date(y, m - 1, 1);
        end   = new Date(y, m, 0, 23, 59, 59, 999);
      } else if (y) {
        start = new Date(y, 0, 1);
        end   = new Date(y, 11, 31, 23, 59, 59, 999);
      }

      if (start && end) filter.createdAt = { $gte: start, $lte: end };
    }

    const pageNum  = Math.max(1, parseInt(page));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * pageSize;

    const [logs, totalCount, allLogs] = await Promise.all([
      UsageLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      UsageLog.countDocuments(filter),
      UsageLog.find(filter).sort({ createdAt: -1 }),   // for summary & charts
    ]);

    const totalRevenue = allLogs.reduce((s, l) => s + (l.totalAmount || 0), 0);
    const totalCost    = allLogs.reduce((s, l) => s + (l.costPrice   || 0), 0);
    const totalProfit  = allLogs.reduce((s, l) => s + (l.profit      || 0), 0);
    const totalPaid    = allLogs.filter((l) => l.paymentStatus === "Paid").reduce((s, l) => s + (l.totalAmount || 0), 0);
    const totalPending = allLogs.filter((l) => l.paymentStatus === "Pending").reduce((s, l) => s + (l.totalAmount || 0), 0);

    return res.status(200).json({
      success: true,
      logs,
      totalCount,
      page: pageNum,
      limit: pageSize,
      summary: { totalRevenue, totalCost, totalProfit, totalPaid, totalPending },
    });
  } catch (error) {
    console.error("Error in getRevenue:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getStockHistory = async (req, res) => {
  try {
    const history = await StockHistory.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
