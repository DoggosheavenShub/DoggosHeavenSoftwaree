import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { editInventoryItem, getInventoryItemDetails, getAllInventory } from "../../store/slices/inventorySlice";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../navbar";

const DISPOSABLE_TYPES = ["Gloves","Cotton","Mask","Bandage","Butterfly Needle","IV Set","DNS","NS","RL","Metrogyl","Micropore Tape","Hydrogen Peroxide","Spirit","Savlon","Sanitizer","Garbage Bag","Pet Wipes","Feeding Tube"];
const INJECTION_SIZES  = ["1 ml","2 ml","3 ml","5 ml"];

const EditInventory = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { addInventoryLoading, loading } = useSelector((s) => s.inventory);
  const { id } = location?.state || {};

  const [formData, setFormData] = useState({
    itemName: "", medicineName: "", brandName: "", saltName: "",
    stock: 0, stockUnit: "ml",
    itemType: "disposable", disposableSubType: "", injectionSubType: "",
    unitCostPrice: 0, unitMinRetailPriceNGO: 0, unitMaxRetailPriceCustomer: 0,
    expiryDate: "",
    supplier: { name: "", contact: "", email: "" },
  });

  useEffect(() => {
    if (!id) return;
    dispatch(getInventoryItemDetails(id)).then((data) => {
      if (data?.payload?.success) {
        const item = data.payload.item;
        setFormData({
          ...item,
          expiryDate: item.expiryDate ? item.expiryDate.split("T")[0] : "",
          supplier: item.supplier || { name: "", contact: "", email: "" },
          disposableSubType: item.disposableSubType || "",
          injectionSubType:  item.injectionSubType  || "",
          medicineName: item.medicineName || "",
          brandName:    item.brandName    || "",
          saltName:     item.saltName     || "",
        });
      } else alert("Error fetching item details");
    });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("supplier.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({ ...prev, supplier: { ...prev.supplier, [key]: value } }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(editInventoryItem(formData)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getAllInventory());
        alert("Inventory item updated successfully!");
        navigate("/staff/inventoryList");
      } else alert(data?.payload?.message || "Failed to update");
    });
  };

  const inputCls = "w-full px-4 py-4 border-2 border-[#85A947]/30 rounded-xl shadow-sm focus:border-[#3E7B27] focus:ring-4 focus:ring-[#85A947]/20 bg-white/90 text-[#123524] font-medium placeholder-[#123524]/50 transition-all duration-200";
  const selectCls = inputCls + " appearance-none cursor-pointer";
  const labelCls = "block text-sm font-bold text-[#3E7B27] mb-2";

  if (addInventoryLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-[#EFE3C2] to-[#85A947]/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#85A947]/30 border-t-[#3E7B27] mx-auto mb-4"></div>
          <p className="text-[#3E7B27] font-semibold text-lg">Updating inventory item...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#EFE3C2] to-[#85A947]/10 py-8">
        <div className="max-w-3xl mx-auto p-8">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-[#85A947]/20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-5 h-5 bg-gradient-to-r from-[#3E7B27] to-[#85A947] rounded-full"></div>
              <h2 className="text-3xl font-bold text-[#123524]">Edit Inventory Item</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Item Name Section */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-sm font-bold text-[#123524] uppercase tracking-widest border-b-2 border-[#85A947]/30 pb-2">Item Name</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className={labelCls}>Medicine Name</label>
                      <input type="text" name="medicineName" value={formData.medicineName} onChange={handleChange} className={inputCls} placeholder="Enter medicine name" />
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>Brand Name</label>
                      <input type="text" name="brandName" value={formData.brandName} onChange={handleChange} className={inputCls} placeholder="Enter brand name" />
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>Salt Name</label>
                      <input type="text" name="saltName" value={formData.saltName} onChange={handleChange} className={inputCls} placeholder="Enter salt name" />
                    </div>
                  </div>
                </div>

                {/* Stock + Unit */}
                <div className="flex flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <label className={labelCls}>Stock</label>
                    <input type="number" name="stock" value={formData.stock} onChange={handleChange} required className={inputCls} placeholder="Enter stock quantity" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className={labelCls}>Stock Unit</label>
                    <select name="stockUnit" value={formData.stockUnit} onChange={handleChange} required className={selectCls}>
                      <option value="ml">Ml</option>
                      <option value="item">Item</option>
                      <option value="tablet">Tablet</option>
                      <option value="mg">Mg</option>
                    </select>
                  </div>
                </div>

                {/* Expiry Date */}
                <div className="space-y-2">
                  <label className={labelCls}>Expiry Date</label>
                  <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className={inputCls} />
                </div>

                {/* Item Type */}
                <div className="space-y-2 md:col-span-2">
                  <label className={labelCls}>Item Type</label>
                  <select
                    name="itemType"
                    value={formData.itemType}
                    onChange={(e) => {
                      handleChange(e);
                      setFormData((prev) => ({ ...prev, disposableSubType: "", injectionSubType: "" }));
                    }}
                    required className={selectCls}
                  >
                    <option value="disposable">Disposable</option>
                    <option value="injection">Injection</option>
                    <option value="medicine">Medicine</option>
                    <option value="vaccine">Vaccine</option>
                  </select>
                </div>

                {/* Disposable Sub-Type */}
                {formData.itemType === "disposable" && (
                  <div className="space-y-2 md:col-span-2">
                    <label className={labelCls}>Disposable Sub-Type</label>
                    <select name="disposableSubType" value={formData.disposableSubType} onChange={handleChange} required className={selectCls}>
                      <option value="">-- Select Disposable Type --</option>
                      {DISPOSABLE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                {/* Injection Sub-Type */}
                {formData.itemType === "injection" && (
                  <div className="space-y-2 md:col-span-2">
                    <label className={labelCls}>Injection Size</label>
                    <select name="injectionSubType" value={formData.injectionSubType} onChange={handleChange} required className={selectCls}>
                      <option value="">-- Select Injection Size --</option>
                      {INJECTION_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className="bg-[#85A947]/10 rounded-xl p-6 border border-[#85A947]/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-[#3E7B27] rounded-full"></div>
                  <h3 className="text-lg font-bold text-[#123524]">Pricing Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className={labelCls}>Unit Cost Price</label>
                    <input type="number" name="unitCostPrice" value={formData.unitCostPrice} onChange={handleChange} className={inputCls} placeholder="Enter cost price" />
                  </div>
                  <div className="space-y-2">
                    <label className={labelCls}>Unit Min Retail Price (NGO)</label>
                    <input type="number" name="unitMinRetailPriceNGO" value={formData.unitMinRetailPriceNGO} onChange={handleChange} className={inputCls} placeholder="Enter NGO price" />
                  </div>
                  <div className="space-y-2">
                    <label className={labelCls}>Unit Max Retail Price (Customer)</label>
                    <input type="number" name="unitMaxRetailPriceCustomer" value={formData.unitMaxRetailPriceCustomer} onChange={handleChange} className={inputCls} placeholder="Enter customer price" />
                  </div>
                </div>
              </div>

              {/* Supplier */}
              <div className="bg-[#85A947]/10 rounded-xl p-6 border border-[#85A947]/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-[#3E7B27] rounded-full"></div>
                  <h3 className="text-lg font-bold text-[#123524]">Supplier Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className={labelCls}>Supplier Name</label>
                    <input type="text" name="supplier.name" value={formData.supplier?.name || ""} onChange={handleChange} className={inputCls} placeholder="Enter supplier name" />
                  </div>
                  <div className="space-y-2">
                    <label className={labelCls}>Supplier Contact</label>
                    <input type="text" name="supplier.contact" value={formData.supplier?.contact || ""} onChange={handleChange} className={inputCls} placeholder="Enter contact number" />
                  </div>
                  <div className="space-y-2">
                    <label className={labelCls}>Supplier Email</label>
                    <input type="email" name="supplier.email" value={formData.supplier?.email || ""} onChange={handleChange} className={inputCls} placeholder="Enter supplier email" />
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-6 border-t border-[#85A947]/20">
                <button type="submit" className="px-12 py-4 bg-gradient-to-r from-[#123524] to-[#3E7B27] text-white font-bold text-lg rounded-xl hover:from-[#3E7B27] hover:to-[#85A947] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[#85A947]/30">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                    Update Inventory Item
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditInventory;
