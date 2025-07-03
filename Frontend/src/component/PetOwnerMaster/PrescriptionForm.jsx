import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllInventory } from "../../store/slices/inventorySlice";
import { useLocation, useNavigate } from "react-router-dom";
import { addPrescription } from "../../store/slices/prescriptionSlice";
import { loadRazorpayScript } from "../../utils/loadRazorpayScript";

const VeterinaryForm = () => {
  const dispatch = useDispatch();
  const { addPrescriptionLoading } = useSelector((state) => state.prescriptions);
  const [customerType, setCustomerType] = useState("pvtltd");
  const [items, setItems] = useState([]);
  const [mg, setMg] = useState([]);
  const [ml, setMl] = useState([]);
  const [tablets, setTablets] = useState([]);
  const [nextFollowUp, setNextFollowUp] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");
  const [followUpPurpose, setFollowUpPurpose] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [formData, setFormData] = useState(null);

  const [itemOptions, setItemOptions] = useState([]);
  const [mlOptions, setMlOptions] = useState([]);
  const [mgOptions, setMgOptions] = useState([]);
  const [tabletOptions, setTabletOptions] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const { _id } = location?.state || "";

  const validateFormBeforePayment = () => {
    // Check if at least one medication is added
    const hasAnyMedication = items.length > 0 || tablets.length > 0 || mg.length > 0 || ml.length > 0;
    if (!hasAnyMedication) {
      alert("Please add at least one medication (Item, Tablet, MG, or ML) before proceeding.");
      return false;
    }

    // Validate Items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.id || item.id === "") {
        alert(`Please select a valid item for Item #${i + 1}`);
        return false;
      }
      if (!item.quantity || item.quantity <= 0) {
        alert(`Please enter a valid quantity for Item #${i + 1}`);
        return false;
      }
      const selectedItem = itemOptions.find(option => option.id === item.id);
      if (selectedItem && item.quantity > selectedItem.stock) {
        alert(`Item #${i + 1}: Only ${selectedItem.stock} units available for ${selectedItem.name}`);
        return false;
      }
    }

    // Validate Tablets
    for (let i = 0; i < tablets.length; i++) {
      const tablet = tablets[i];
      if (!tablet.id || tablet.id === "") {
        alert(`Please select a valid tablet for Tablet #${i + 1}`);
        return false;
      }
      if (!tablet.quantity || tablet.quantity <= 0) {
        alert(`Please enter a valid quantity for Tablet #${i + 1}`);
        return false;
      }
      const selectedTablet = tabletOptions.find(option => option.id === tablet.id);
      if (selectedTablet && tablet.quantity > selectedTablet.stock) {
        alert(`Tablet #${i + 1}: Only ${selectedTablet.stock} units available for ${selectedTablet.name}`);
        return false;
      }
    }

    // Validate MG Items
    for (let i = 0; i < mg.length; i++) {
      const mgItem = mg[i];
      if (!mgItem.id || mgItem.id === "") {
        alert(`Please select a valid MG item for MG Item #${i + 1}`);
        return false;
      }
      if (!mgItem.quantity || mgItem.quantity <= 0) {
        alert(`Please enter a valid quantity for MG Item #${i + 1}`);
        return false;
      }
      const selectedMg = mgOptions.find(option => option.id === mgItem.id);
      if (selectedMg && mgItem.quantity > selectedMg.stock) {
        alert(`MG Item #${i + 1}: Only ${selectedMg.stock} units available for ${selectedMg.name}`);
        return false;
      }
    }

    // Validate ML Items
    for (let i = 0; i < ml.length; i++) {
      const mlItem = ml[i];
      if (!mlItem.id || mlItem.id === "") {
        alert(`Please select a valid ML item for ML Item #${i + 1}`);
        return false;
      }
      if (!mlItem.quantity || mlItem.quantity <= 0) {
        alert(`Please enter a valid quantity for ML Item #${i + 1}`);
        return false;
      }
      const selectedMl = mlOptions.find(option => option.id === mlItem.id);
      if (selectedMl && mlItem.quantity > selectedMl.stock) {
        alert(`ML Item #${i + 1}: Only ${selectedMl.stock} units available for ${selectedMl.name}`);
        return false;
      }
    }

    // Validate Follow-up fields (all or none)
    const hasFollowUpDate = nextFollowUp && nextFollowUp.trim() !== "";
    const hasFollowUpTime = followUpTime && followUpTime.trim() !== "";
    const hasFollowUpPurpose = followUpPurpose && followUpPurpose.trim() !== "";

    if (hasFollowUpDate || hasFollowUpTime || hasFollowUpPurpose) {
      if (!hasFollowUpDate) {
        alert("Follow-up date is required when scheduling follow-up");
        return false;
      }
      if (!hasFollowUpTime) {
        alert("Follow-up time is required when scheduling follow-up");
        return false;
      }
      if (!hasFollowUpPurpose) {
        alert("Follow-up purpose is required when scheduling follow-up");
        return false;
      }
    }

    return true;
  };

  const startPayment = async (amount, prescriptionData) => {
    const razorpayLoaded = await loadRazorpayScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!razorpayLoaded) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    // Create order on backend
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/v1/payments/create-order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("authtoken"),
        },
        body: JSON.stringify({
          amount: amount,
          receipt: `prescription:${_id}`,
        }),
      }
    );

    const { order } = await res.json();

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: order.amount,
      currency: "INR",
      name: "Doggos Heaven",
      description: "Prescription Payment",
      order_id: order.id,
      handler: async function (response) {
        const verifyRes = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/payments/verify-payment2`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: localStorage.getItem("authtoken") || "",
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
            }),
          }
        );

        const result = await verifyRes.json();

        if (result.success) {
          // Payment successful, now save prescription
          savePrescriptionAfterPayment(prescriptionData);
        } else {
          alert("❌ Payment Failed!");
        }
      },
      theme: { color: "#528FF0" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const savePrescriptionAfterPayment = (prescriptionData) => {
    dispatch(addPrescription(prescriptionData))
      .then((data) => {
        if (data?.payload?.success) {
          alert("✅ Payment Done Successfully! Prescription saved.");
          navigate("/history");
        } else {
          alert("Payment successful but failed to save prescription: " + data?.payload?.message);
        }
      })
      .catch((err) => {
        alert("Payment successful but error saving prescription");
      });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const handleTabletChange = (index, field, value) => {
    const updatedTablets = [...tablets];
    updatedTablets[index][field] = value;
    setTablets(updatedTablets);
  };

  const handleMgChange = (index, field, value) => {
    const updatedMg = [...mg];
    updatedMg[index][field] = value;
    setMg(updatedMg);
  };

  const handleMlChange = (index, field, value) => {
    const updatedMl = [...ml];
    updatedMl[index][field] = value;
    setMl(updatedMl);
  };

  useEffect(() => {
    const fetchAndFilterInventory = async () => {
      try {
        const data = await dispatch(getAllInventory());

        if (data?.payload?.success) {
          const temp = data?.payload?.items;
          console.log(temp, "inventory data");

          setMlOptions(
            temp
              .filter((item) => item.stockUnit === "ml")
              .map((item) => ({
                id: item._id,
                name: item.itemName,
                unitMinRetailPriceNGO: item.unitMinRetailPriceNGO,
                unitMaxRetailPriceCustomer: item.unitMaxRetailPriceCustomer,
                stock: item.stock,
              }))
          );

          setMgOptions(
            temp
              .filter((item) => item.stockUnit === "mg")
              .map((item) => ({
                id: item._id,
                name: item.itemName,
                unitMinRetailPriceNGO: item.unitMinRetailPriceNGO,
                unitMaxRetailPriceCustomer: item.unitMaxRetailPriceCustomer,
                stock: item.stock,
              }))
          );

          setItemOptions(
            temp
              .filter((item) => item.stockUnit === "item")
              .map((item) => ({
                id: item._id,
                name: item.itemName,
                unitMinRetailPriceNGO: item.unitMinRetailPriceNGO,
                unitMaxRetailPriceCustomer: item.unitMaxRetailPriceCustomer,
                stock: item.stock,
              }))
          );

          setTabletOptions(
            temp
              .filter((item) => item.stockUnit === "tablet")
              .map((item) => ({
                id: item._id,
                name: item.itemName,
                unitMinRetailPriceNGO: item.unitMinRetailPriceNGO,
                unitMaxRetailPriceCustomer: item.unitMaxRetailPriceCustomer,
                stock: item.stock,
              }))
          );
        }
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };

    fetchAndFilterInventory();
  }, [dispatch]);

  const calculateTotalPrice = () => {
    let itemTotal = items.reduce((acc, med) => {
      const item = itemOptions.find((m) => m.id === med.id);
      if (!item || !med.quantity) return acc;

      const price =
        customerType === "NGO"
          ? item.unitMinRetailPriceNGO
          : item.unitMaxRetailPriceCustomer;
      return acc + price * med.quantity;
    }, 0);

    let mgTotal = mg.reduce((acc, med) => {
      const mgItem = mgOptions.find((m) => m.id === med.id);
      if (!mgItem || !med.quantity) return acc;

      const price =
        customerType === "NGO"
          ? mgItem.unitMinRetailPriceNGO
          : mgItem.unitMaxRetailPriceCustomer;
      return acc + price * med.quantity;
    }, 0);

    let mlTotal = ml.reduce((acc, med) => {
      const mlItem = mlOptions.find((m) => m.id === med.id);
      if (!mlItem || !med.quantity) return acc;

      const price =
        customerType === "NGO"
          ? mlItem.unitMinRetailPriceNGO
          : mlItem.unitMaxRetailPriceCustomer;
      return acc + price * med.quantity;
    }, 0);

    let tabletTotal = tablets.reduce((acc, med) => {
      const tablet = tabletOptions.find((m) => m.id === med.id);
      if (!tablet || !med.quantity) return acc;

      const price =
        customerType === "NGO"
          ? tablet.unitMinRetailPriceNGO
          : tablet.unitMaxRetailPriceCustomer;
      return acc + price * med.quantity;
    }, 0);

    const newTotal = itemTotal + mgTotal + mlTotal + tabletTotal;
    setTotalPrice(newTotal);
  };

  useEffect(() => {
    calculateTotalPrice();
  }, [
    items,
    mg,
    ml,
    tablets,
    customerType,
    itemOptions,
    mgOptions,
    mlOptions,
    tabletOptions,
  ]);

  const handleCustomerTypeChange = (value) => {
    setCustomerType(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!_id || _id.trim() === "") {
      console.error("Missing pet ID");
      alert("A pet must be selected. Please select a pet before proceeding.");
      return;
    }

    if (!customerType) {
      alert("Please select a customer type.");
      return;
    }

    // Validation check before payment
    if (!validateFormBeforePayment()) {
      return;
    }

    const prescriptionData = {
      petId: _id,
      customerType,
      items,
      tablets,
      ml,
      mg,
      nextFollowUp,
      followUpTime,
      followUpPurpose,
      diagnosis,
      totalPrice
    };

    setFormData(prescriptionData);
    startPayment(totalPrice, prescriptionData);
  };

  const resetForm = () => {
    setCustomerType("pvtltd");
    setItems([]);
    setTablets([]);
    setMg([]);
    setMl([]);
    setNextFollowUp("");
    setFollowUpTime("");
    setFollowUpPurpose("");
    setDiagnosis("");
    setTotalPrice(0);
    setFormData(null);
  };

  if (addPrescriptionLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-[#EFE3C2] to-[#85A947]/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#85A947]/30 border-t-[#3E7B27] mx-auto mb-4"></div>
          <p className="text-[#3E7B27] font-semibold text-lg">
            Adding prescription...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Veterinary Prescription Form
        </h1>

        <div className="space-y-6">
          {/* Customer Type */}
          <div>
            <label className="block font-medium mb-1">Customer Type</label>
            <select
              value={customerType}
              onChange={(e) => handleCustomerTypeChange(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pvtltd">Pvt Ltd</option>
              <option value="NGO">NGO</option>
            </select>
          </div>

          {/* Items Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Items</h2>
            {items.map((item, index) => (
              <div key={index} className="flex items-center space-x-3 mb-3 p-3 bg-white rounded border">
                <div className="flex-1">
                  <label className="block font-medium mb-1 text-sm">Item</label>
                  <select
                    value={item.id}
                    onChange={(e) => handleItemChange(index, "id", e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Item</option>
                    {itemOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name} (Stock: {option.stock})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1 text-sm">Quantity</label>
                  <input
                    type="number"
                    value={item.quantity || ""}
                    onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || "")}
                    min="1"
                    placeholder="Qty"
                    className="p-2 border rounded-md w-20 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setItems(items.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded mt-6"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setItems([...items, { id: "", quantity: 1 }])}
              className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              + Add Item
            </button>
          </div>

          {/* Tablets Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Tablets</h2>
            {tablets.map((tablet, index) => (
              <div key={index} className="flex items-center space-x-3 mb-3 p-3 bg-white rounded border">
                <div className="flex-1">
                  <label className="block font-medium mb-1 text-sm">Tablet</label>
                  <select
                    value={tablet.id}
                    onChange={(e) => handleTabletChange(index, "id", e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Tablet</option>
                    {tabletOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name} (Stock: {option.stock})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1 text-sm">Quantity</label>
                  <input
                    type="number"
                    value={tablet.quantity || ""}
                    onChange={(e) => handleTabletChange(index, "quantity", parseInt(e.target.value) || "")}
                    min="1"
                    placeholder="Qty"
                    className="p-2 border rounded-md w-20 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setTablets(tablets.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded mt-6"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setTablets([...tablets, { id: "", quantity: 1 }])}
              className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              + Add Tablet
            </button>
          </div>

          {/* Mg Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Mg Items</h2>
            {mg.map((mgItem, index) => (
              <div key={index} className="flex items-center space-x-3 mb-3 p-3 bg-white rounded border">
                <div className="flex-1">
                  <label className="block font-medium mb-1 text-sm">Mg Item</label>
                  <select
                    value={mgItem.id}
                    onChange={(e) => handleMgChange(index, "id", e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Mg Item</option>
                    {mgOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name} (Stock: {option.stock})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1 text-sm">Quantity</label>
                  <input
                    type="number"
                    value={mgItem.quantity || ""}
                    onChange={(e) => handleMgChange(index, "quantity", parseInt(e.target.value) || "")}
                    min="1"
                    placeholder="Qty"
                    className="p-2 border rounded-md w-20 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setMg(mg.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded mt-6"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setMg([...mg, { id: "", quantity: 1 }])}
              className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              + Add Mg Item
            </button>
          </div>

          {/* Ml Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Ml Items</h2>
            {ml.map((mlItem, index) => (
              <div key={index} className="flex items-center space-x-3 mb-3 p-3 bg-white rounded border">
                <div className="flex-1">
                  <label className="block font-medium mb-1 text-sm">Ml Item</label>
                  <select
                    value={mlItem.id}
                    onChange={(e) => handleMlChange(index, "id", e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Ml Item</option>
                    {mlOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name} (Stock: {option.stock})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1 text-sm">Quantity</label>
                  <input
                    type="number"
                    value={mlItem.quantity || ""}
                    onChange={(e) => handleMlChange(index, "quantity", parseInt(e.target.value) || "")}
                    min="1"
                    placeholder="Qty"
                    className="p-2 border rounded-md w-20 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setMl(ml.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded mt-6"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setMl([...ml, { id: "", quantity: 1 }])}
              className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              + Add Ml Item
            </button>
          </div>

          {/* Follow-Up Details */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Follow-Up Details</h2>
            <div className="space-y-3">
              <div>
                <label className="block font-medium mb-1">Follow-up Date</label>
                <input
                  onChange={(e) => setNextFollowUp(e.target.value)}
                  value={nextFollowUp}
                  type="date"
                  min={new Date(new Date().getTime() + 86400000).toISOString().split("T")[0]}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Follow-up Time</label>
                <input
                  onChange={(e) => setFollowUpTime(e.target.value)}
                  value={followUpTime}
                  type="time"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Follow-up Purpose</label>
                <input
                  onChange={(e) => setFollowUpPurpose(e.target.value)}
                  value={followUpPurpose}
                  placeholder="Enter follow-up purpose"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Diagnosis</label>
                <input
                  onChange={(e) => setDiagnosis(e.target.value)}
                  value={diagnosis}
                  placeholder="Enter diagnosis"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Total Price Display */}
          <div className="p-4 bg-blue-50 rounded-md border-2 border-blue-200">
            <div className="text-xl font-bold text-blue-800">
              Total Price: ₹{totalPrice.toFixed(2)}
            </div>
            <div className="text-sm text-blue-600 mt-1">
              Customer Type: {customerType === "NGO" ? "NGO Pricing" : "Standard Pricing"}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 font-medium"
            >
              {totalPrice === 0 ? "Save Prescription" : "Proceed to Payment"}
            </button>
            <button
              onClick={resetForm}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200 font-medium"
            >
              Reset Form
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VeterinaryForm;