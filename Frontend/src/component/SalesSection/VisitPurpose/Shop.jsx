import React, { useState } from "react";
import { addShoppingVisit } from "../../../store/slices/visitSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const Shop = ({ _id, visitPurposeDetails }) => {
  const [items, setItems] = useState([{ name: "", price: 0 }]);
  const [totalPrice, setTotalPrice] = useState(0);
  const dispatch=useDispatch();
  const navigate=useNavigate();
  const [isLoading,setIsLoading]=useState(false);

  const handleChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === "price" ? Number(value) : value;
    setItems(newItems);
    calculateTotal(newItems);
  };

  const calculateTotal = (items) => {
    const total = items.reduce(
      (acc, item) => acc + (Number(item.price) || 0),
      0
    );
    setTotalPrice(total);
  };

  const addItem = () => {
    setItems([...items, { name: "", price: 0 }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    calculateTotal(newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data={};
    data.items=items
    data.petId = _id;
    data.visitType = visitPurposeDetails._id;

    dispatch(addShoppingVisit(data))
      .then((data) => {
        if (data?.payload?.success) {
          alert("Visit saved successfully");
          navigate("/dashboard");
        } else alert(data?.payload?.message);
        setIsLoading(false);
      })
      .catch(() => {
        alert("Error saving data");
        setIsLoading(false);
      });
  };

  return (
    <div className="max-w-full mx-auto p-6 bg-white shadow-lg rounded-md">
      <form onSubmit={handleSubmit}>
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 mb-3 border p-3 rounded-md bg-gray-50"
          >
            <input
              type="text"
              value={item.name}
              onChange={(e) => handleChange(index, "name", e.target.value)}
              placeholder="Item Name"
              className="p-2 border rounded-md flex-1 focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="number"
              value={item.price}
              onChange={(e) => handleChange(index, "price", e.target.value)}
              placeholder="Price"
              className="p-2 border rounded-md w-24 focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-red-600 hover:text-red-800"
            >
              ✖
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="w-full text-center py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          + Add Item
        </button>

        <h1 className="text-lg font-bold text-gray-700 mt-4">
          Total Price: {totalPrice}
        </h1>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Shop;
