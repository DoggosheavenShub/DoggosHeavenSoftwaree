import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAllInventory, deleteInventoryItem } from "../../store/slices/inventorySlice";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";

const InventoryList = () => {
  const [inventory, setInventory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getAllInventoryLoading, deleteInventoryLoading } = useSelector((state) => state.inventory);
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

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this inventory item?")) {
      setDeleteItemId(id);
      
      dispatch(deleteInventoryItem(id))
        .then((response) => {
          if (response?.payload?.success) {
            // Remove the deleted item from the state
            const updatedInventory = inventory.filter(item => item._id !== id);
            setInventory(updatedInventory);
            setInitialInventory(updatedInventory);
            alert("Inventory item deleted successfully!");
          } else {
            alert("Failed to delete inventory item!");
          }
        })
        .catch((error) => {
          console.error("Error deleting inventory item:", error);
          alert("An error occurred while deleting the inventory item.");
        })
        .finally(() => {
          setDeleteItemId(null);
        });
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
                  <div className="flex space-x-3 mt-3">
                    <button
                      className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(item?._id);
                      }}
                    >
                      Edit Details
                    </button>
                    <button
                      className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item?._id);
                      }}
                      disabled={deleteInventoryLoading && deleteItemId === item._id}
                    >
                      {deleteInventoryLoading && deleteItemId === item._id ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Deleting...
                        </span>
                      ) : (
                        "Delete"
                      )}
                    </button>
                  </div>
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