import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addVeterinaryVisit } from "../../../store/slices/visitSlice";
import { getAllInventory } from "../../../store/slices/inventorySlice";
import { useNavigate } from "react-router-dom";

const Veterinary = ({ _id, visitPurposeDetails }) => {
  const dispatch = useDispatch();
  const [customerType, setCustomerType] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [nextFollowUp, setNextFollowUp] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");
  const [followUpPurpose, setFollowUpPurpose] = useState("");
  const [medicineOptions, setMedicineOptions] = useState([]);
  const [vaccineOptions, setVaccineOptions] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchAndFilterInventory = async () => {
      try {
        const data = await dispatch(getAllInventory());

        if (data?.payload?.success) {
          const items = data?.payload?.items;
          setMedicineOptions(
            items
              .filter((item) => item.itemType === "medicine")
              .map((item) => ({
                id: item._id,
                name: item.itemName,
                unitMinRetailPriceNGO: item.unitMinRetailPriceNGO,
                unitMaxRetailPriceCustomer: item.unitMaxRetailPriceCustomer,
              }))
          );

          setVaccineOptions(
            items
              .filter((item) => item.itemType !== "medicine")
              .map((item) => ({
                id: item._id,
                name: item.itemName,
                unitMinRetailPriceNGO: item.unitMinRetailPriceNGO,
                unitMaxRetailPriceCustomer: item.unitMaxRetailPriceCustomer,
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
    let medicineTotal = medicines.reduce((acc, med) => {
      const medicine = medicineOptions.find((m) => m.id === med.id);
      if (!medicine) return acc;
      return (
        acc +
        (customerType === "NGO"
          ? medicine.unitMinRetailPriceNGO * med.quantity
          : medicine.unitMaxRetailPriceCustomer * med.quantity)
      );
    }, 0);

    let vaccineTotal = vaccines.reduce((acc, vac) => {
      const vaccine = vaccineOptions.find((v) => v.id === vac.id);
      if (!vaccine) return acc;
      return (
        acc +
        (customerType === "NGO"
          ? vaccine.unitMinRetailPriceNGO * vac.volume
          : vaccine.unitMaxRetailPriceCustomer * vac.volume)
      );
    }, 0);

    setTotalPrice(medicineTotal + vaccineTotal);
  };
  
  const navigate=useNavigate();

  useEffect(() => {
    calculateTotalPrice();
  }, [medicines, vaccines, customerType, medicineOptions, vaccineOptions]);

  const handleCustomerTypeChange = (value) => {
    setCustomerType(value);
    calculateTotalPrice(); // Recalculate immediately after customerType changes
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index][field] = value;
    setMedicines(updatedMedicines);
  };

  const handleVaccineChange = (index, field, value) => {
    const updatedVaccines = [...vaccines];
    updatedVaccines[index][field] = value;
    setVaccines(updatedVaccines);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      customerType,
      medicines,
      vaccines,
      nextFollowUp,
      followUpTime,
      followUpPurpose,
      petId: _id,
      visitType: visitPurposeDetails._id,
    };

    try {
      const data = await dispatch(addVeterinaryVisit(formData));
      if (data?.payload?.success) {
        alert("Visit saved successfully");
        setCustomerType("");
        setMedicines([]);
        setVaccines([]);
        setNextFollowUp("");
        setFollowUpTime("");
        setFollowUpPurpose("");
        setTotalPrice(0);

        navigate("/dashboard")
      } else {
        alert(data?.payload?.message);
      }
    } catch {
      alert("Error saving data");
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Veterinary Inquiry Form
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Type */}
        <div>
          <label className="block font-medium mb-1">Customer Type</label>
          <select
            value={customerType}
            onChange={(e) => handleCustomerTypeChange(e.target.value)}
            required
            className="w-full mt-1 p-2 border rounded-md"
          >
            <option value="" disabled>
              Select Customer Type
            </option>
            <option value="pvtltd">Pvt Ltd</option>
            <option value="NGO">NGO</option>
          </select>
        </div>

        {/* Medicine Inquiry */}
        <div className="p-4 bg-gray-100 rounded-md">
          <h2 className="text-lg font-semibold mb-3">Medicine Inquiry</h2>
          {medicines.map((medicine, index) => (
            <div key={index} className="flex items-center space-x-3 mb-3">
              <div className="flex-1">
                <label className="block font-medium mb-1">Medicine</label>
                <select
                  value={medicine.id}
                  onChange={(e) =>
                    handleMedicineChange(index, "id", e.target.value)
                  }
                  required
                  className="w-full p-2 border rounded-md"
                >
                  <option value="" disabled>
                    Select Medicine
                  </option>
                  {medicineOptions.map((med) => (
                    <option key={med.id} value={med.id}>
                      {med.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  value={medicine.quantity}
                  onChange={(e) =>
                    handleMedicineChange(index, "quantity", e.target.value)
                  }
                  placeholder="Quantity"
                  className="p-2 border rounded-md w-20"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  setMedicines(medicines.filter((_, i) => i !== index))
                }
                className="text-red-500 font-medium self-end"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setMedicines([...medicines, { id: "", quantity: 1 }])
            }
            className="mt-2 text-blue-600 font-medium"
          >
            + Add Medicine
          </button>
        </div>

        {/* Vaccine Inquiry */}
        <div className="p-4 bg-gray-100 rounded-md">
          <h2 className="text-lg font-semibold mb-3">Vaccine Inquiry</h2>
          {vaccines.map((vaccine, index) => (
            <div key={index} className="flex items-center space-x-3 mb-3">
              <div className="flex-1">
                <label className="block font-medium mb-1">Vaccine</label>
                <select
                  value={vaccine.id}
                  onChange={(e) =>
                    handleVaccineChange(index, "id", e.target.value)
                  }
                  required
                  className="w-full p-2 border rounded-md"
                >
                  <option value="" disabled>
                    Select Vaccine
                  </option>
                  {vaccineOptions.map((vac) => (
                    <option key={vac.id} value={vac.id}>
                      {vac.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Volume (ml)</label>
                <input
                  type="number"
                  value={vaccine.volume}
                  onChange={(e) =>
                    handleVaccineChange(index, "volume", e.target.value)
                  }
                  placeholder="Volume (ml)"
                  className="p-2 border rounded-md w-24"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Dose Number</label>
                <input
                  type="number"
                  value={vaccine.doseNumber}
                  onChange={(e) =>
                    handleVaccineChange(index, "doseNumber", e.target.value)
                  }
                  placeholder="Dose Number"
                  className="p-2 border rounded-md w-24"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  setVaccines(vaccines.filter((_, i) => i !== index))
                }
                className="text-red-500 font-medium self-end"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setVaccines([...vaccines, { id: "", volume: 1, doseNumber: 1 }])
            }
            className="mt-2 text-blue-600 font-medium"
          >
            + Add Vaccine
          </button>
        </div>

        {/* Follow-Up Details */}
        <div className="p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-3">Follow-Up Details</h2>
          <div>
            <label>Follow-up date:</label>
            <input
              onChange={(e) => setNextFollowUp(e.target.value)}
              value={nextFollowUp}
              type="date"
              min={today}
              className="w-full p-2 border rounded-md mb-2"
            />
          </div>
          <div>
            <label>Follow-up time:</label>
            <input
              onChange={(e) => setFollowUpTime(e.target.value)}
              value={followUpTime}
              type="time"
              className="w-full p-2 border rounded-md mb-2"
            />
          </div>
          <div>
            <label>Follow-up purpose:</label>
            <input
              onChange={(e) => setFollowUpPurpose(e.target.value)}
              value={followUpPurpose}
              placeholder="Follow-Up Purpose"
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        <div className="text-xl font-bold">
          Total Price: ₹{totalPrice.toFixed(2)}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md"
        >
          Submit Inquiry
        </button>
      </form>
    </div>
  );
};

export default Veterinary;
