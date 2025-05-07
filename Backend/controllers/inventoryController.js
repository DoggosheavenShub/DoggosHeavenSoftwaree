const Inventory = require("../models/inventory");

exports.addinventory = async (req, res) => {
  try {
    const {
      itemName,
      stockUnit,
      itemType,
      volumeML,
      totalVolume,
      unitCostPrice,
      unitMinRetailPriceNGO,
      unitMaxRetailPriceCustomer,
      recommendedDoses,
    } = req.body;

    if (itemType !== "medicine") {
      if (
        !itemName ||
        !stockUnit ||
        !itemType ||
        !volumeML ||
        !totalVolume ||
        !unitCostPrice ||
        !unitMaxRetailPriceCustomer ||
        !unitMinRetailPriceNGO ||
        !recommendedDoses
      ) {
        return res.status(400).json({
          success: false,
          message: "All fields need to  be filled",
        });
      }
    } else {
      if (
        !itemName ||
        !stockUnit ||
        !itemType ||
        !unitCostPrice ||
        !unitMaxRetailPriceCustomer ||
        !unitMinRetailPriceNGO
      )
        return res.status(400).json({
          success: false,
          message: "All fields need to  be filled",
        });
    }

    const newItem = new Inventory({
      itemName,
      stockUnit,
      itemType,
      volumeML,
      totalVolume,
      unitCostPrice,
      unitMaxRetailPriceCustomer,
      unitMinRetailPriceNGO,
      recommendedDoses,
    });
    if (newItem) {
      await newItem.save();
      return res.status(200).json({
        success: true,
        message: "Inventory item created successfully",
        item: newItem,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid details",
        item: newItem,
      });
    }
  } catch (error) {
    console.log("Error in add inventory controller");
    res.status(500).json({
      success: false,
      message: "Error creating inventory item",
      error: error.message,
    });
  }
};

exports.getInventoryList = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ itemName: 1 });
    return res.status(200).json({
      success: true,
      message: "Items fetched successfully",
      items,
    });
  } catch (error) {
    console.log("Error in getInventoryList Controller");
    res.status(500).json({
      success: false,
      message: "Error fetching inventory items",
      error: error.message,
    });
  }
};

exports.editInventory = async (req, res) => {
  try {
    const {
      _id,
      itemName,
      stockUnit,
      itemType,
      volumeML,
      totalVolume,
      unitCostPrice,
      unitMinRetailPriceNGO,
      unitMaxRetailPriceCustomer,
      recommendedDoses,
    } = req.body;

    if (itemType !== "medicine") {
      if (
        !_id ||
        !itemName ||
        !stockUnit ||
        !itemType ||
        !volumeML ||
        !totalVolume ||
        !unitCostPrice ||
        !unitMaxRetailPriceCustomer ||
        !unitMinRetailPriceNGO ||
        !recommendedDoses
      ) {
        return res.status(400).json({
          success: false,
          message: "All fields need to  be filled",
        });
      }
    } else {
      if (
        !itemName ||
        !stockUnit ||
        !itemType ||
        !unitCostPrice ||
        !unitMaxRetailPriceCustomer ||
        !unitMinRetailPriceNGO
      )
        return res.status(400).json({
          success: false,
          message: "All fields need to  be filled",
        });
    }

    const response = await Inventory.findByIdAndUpdate(_id, {
      itemName,
      stockUnit,
      itemType,
      volumeML,
      totalVolume,
      unitCostPrice,
      unitMaxRetailPriceCustomer,
      unitMinRetailPriceNGO,
      recommendedDoses,
    });

    return res.status(200).json({
      success: true,
      message: "Inventory details updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the inventory item by ID
    const inventoryItem = await Inventory.findById(id);
    
    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found"
      });
    }
    
    // Delete the inventory item
    await Inventory.findByIdAndDelete(id);
    
    return res.status(200).json({
      success: true,
      message: "Inventory item deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete inventory item",
      error: error.message
    });
  }
};

exports.getInventoryItemDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Inventory.findById(id);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Inventory item not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Item Details fetched successfully",
      item,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching inventory item", error: error.message });
  }
};

exports.getAlertListOfInventory = async (req, res) => {
  try {
    const items = await Inventory.find({ totalVolume: { $lte: 100 } }).sort({
      itemName: 1,
    });
    return res.status(200).json({
      success: true,
      message: "Items fetched successfully",
      items,
    });
  } catch (error) {
    console.log("Error in getInventoryList Controller");
    res.status(500).json({
      success: false,
      message: "Error fetching inventory items",
      error: error.message,
    });
  }
};


