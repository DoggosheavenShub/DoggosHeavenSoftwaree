import React, { useState } from "react";
import { addInventoryItem } from "../../store/slices/inventorySlice";
import { useDispatch, useSelector } from "react-redux";

const InventoryForm = () => {
  const { addInventoryLoading } = useSelector((state) => state.inventory);

  const [formData, setFormData] = useState({
    itemName: "",
    stockUnit: 0,
    itemType: "disposable",
    volumeML: 0,
    totalVolume: 0,
    recommendedDoses: 0,
    unitCostPrice: 0,
    unitMinRetailPriceNGO: 0,
    unitMaxRetailPriceCustomer: 0,
  });

  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(addInventoryItem(formData))
      .then((data) => {
        if (data?.payload?.success) {
          alert("Inventory item added successfully!");
          setFormData({
            itemName: "",
            stockUnit: 0,
            itemType: "disposable",
            volumeML: 0,
            totalVolume: 0,
            recommendedDoses: 0,
            unitCostPrice: 0,
            unitMinRetailPriceNGO: 0,
            unitMaxRetailPriceCustomer: 0,
          });
        } else alert(data?.payload?.message);
      })
      .catch((err) => {
        alert("Failed to add inventory item");
        
      });
  };

  if (addInventoryLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  } else
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Add Inventory Item</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Item Name:</label>
            <input
              type="text"
              name="itemName"
              value={formData.itemName}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-1">Stock Unit:</label>
            <input
              type="number"
              name="stockUnit"
              value={formData.stockUnit}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-1">Item Type:</label>
            <select
              name="itemType"
              value={formData.itemType}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            >
              <option value="disposable">Disposable</option>
              <option value="syringe">Syringe</option>
              <option value="medicine">Medicine</option>
            </select>
          </div>

          {/* <div>
          <label className="block mb-1">Recommended Doses:</label>
          <input
            type="number"
            name="recommendedDoses"
            value={formData.recommendedDoses}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Volume (ML):</label>
          <input
            type="number"
            name="volumeML"
            value={formData.volumeML}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Total Volume:</label>
          <input
            type="number"
            name="totalVolume"
            value={formData.totalVolume}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div> */}

          {formData.itemType !== "medicine" && (
            <>
              <div>
                <label className="block mb-1">Recommended Doses:</label>
                <input
                  type="number"
                  name="recommendedDoses"
                  value={formData.recommendedDoses}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block mb-1">Volume (ML):</label>
                <input
                  type="number"
                  name="volumeML"
                  value={formData.volumeML}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block mb-1">Total Volume:</label>
                <input
                  type="number"
                  name="totalVolume"
                  value={formData.totalVolume}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </>
          )}

          <div>
            <label className="block mb-1">Unit Cost Price:</label>
            <input
              type="number"
              name="unitCostPrice"
              value={formData.unitCostPrice}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-1">Unit Min Retail Price (NGO):</label>
            <input
              type="number"
              name="unitMinRetailPriceNGO"
              value={formData.unitMinRetailPriceNGO}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-1">
              Unit Max Retail Price (Customer):
            </label>
            <input
              type="number"
              name="unitMaxRetailPriceCustomer"
              value={formData.unitMaxRetailPriceCustomer}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <button
            type="submit"
            className="w-full  bg-blue-950 text-white p-2 rounded hover:bg-blue-600"
          >
            Add Item
          </button>
        </form>
      </div>
    );
};

export default InventoryForm;
