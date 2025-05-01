import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAllInventory } from "../../store/slices/inventorySlice";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";

const InventoryList = () => {
  const [inventory, setInventory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getAllInventoryLoading } = useSelector((state) => state.inventory);
  const [searchTerm, setSearchTerm] = useState("");
  const [initialInventory, setInitialInventory] = useState([]);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    dispatch(getAllInventory())
      .then((data) => {
        if(data?.payload?.success){
        setInitialInventory(data?.payload?.items);
        setInventory(data?.payload?.items);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    const currentList = [...initialInventory];
    if (searchTerm) {
      const filteredList = currentList.filter((item) =>
        item?.itemName
          .trim()
          .toLowerCase()
          .startsWith(searchTerm.trim().toLowerCase())
      );
      setInventory(filteredList);
    } else setInventory(initialInventory);
  }, [searchTerm]);

  const toggleItemDetails = (itemId) => {
    if (selectedItem === itemId) {
      setSelectedItem(null);
    } else {
      setSelectedItem(itemId);
    }
  };

  if (getAllInventoryLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">Error: {error}</div>;
  }

  const handleEdit = (id) => {
    navigate(`/editInventory`, { state: { id } });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col gap-y-3 items-center mb-8">
        <h2 className="text-2xl font-bold mb-6 ">Inventory List</h2>
        <div className="w-full flex justify-between items-center">
          <Link to="/inventory">
            <button className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white  bg-blue-950 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Add Inventory
            </button>
          </Link>
          <Link to="/alertlist">
            <button className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white  bg-blue-950 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Alert List
            </button>
          </Link>
        </div>
      </div>

      <div className="">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search inventory items..."
          className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
        />
      </div>
      <div className="space-y-4 mt-5">
        {inventory?.length === 0 ? (
          <p className="text-gray-500 text-center">No inventory items found</p>
        ) : (
          inventory?.map((item) => (
            <div key={item._id} className="border rounded-lg overflow-hidden">
              <div
                className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                onClick={() => toggleItemDetails(item._id)}
              >
                <div className="font-medium">{item.itemName}</div>
                <div className="flex space-x-4">
                  <span className="text-gray-600">Stock: {item.stockUnit}</span>
                  <span className="text-gray-600">{item.itemType}</span>
                  <span
                    className={`transform transition-transform ${
                      selectedItem === item._id ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </div>
              </div>

              {selectedItem === item._id && (
                <div className="p-4 bg-white border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Details</h3>
                      <p>
                        <span className="font-medium">Volume (ML):</span>{" "}
                        {item.volumeML}
                      </p>
                      <p>
                        <span className="font-medium">Total Volume:</span>{" "}
                        {item.totalVolume}
                      </p>
                      <p>
                        <span className="font-medium">Item Type:</span>{" "}
                        {item.itemType}
                      </p>
                      <p>
                        <span className="font-medium">Recommended Doses:</span>{" "}
                        {item?.recommendedDoses}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Pricing</h3>
                      <p>
                        <span className="font-medium">Unit Cost:</span> $
                        {item.unitCostPrice}
                      </p>
                      <p>
                        <span className="font-medium">NGO Price:</span> $
                        {item.unitMinRetailPriceNGO}
                      </p>
                      <p>
                        <span className="font-medium">Customer Price:</span> $
                        {item.unitMaxRetailPriceCustomer}
                      </p>
                    </div>
                  </div>
                  <button
                    className="bg-[green] mt-3 text-[white] px-5 py-2 rounded-lg"
                    onClick={() => handleEdit(item?._id)}
                  >
                    Edit Details
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InventoryList;
