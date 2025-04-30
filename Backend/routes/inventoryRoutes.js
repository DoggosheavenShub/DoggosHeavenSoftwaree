const express =require('express');
const { addinventory, editInventory, getInventoryList, getInventoryItemDetails, getAlertListOfInventory } = require('../controllers/inventoryController');
const {protectedRoute}=require("../middlewares/protectedRoute")

const router=express.Router();

router.post("/addinventory",protectedRoute,addinventory);
router.post("/editinventory",protectedRoute,editInventory);
router.get("/getallinventory",protectedRoute,getInventoryList);
router.get("/getinventoryitemdetails/:id",protectedRoute,getInventoryItemDetails);
router.get("/getalertlist",protectedRoute,getAlertListOfInventory);

module.exports=router