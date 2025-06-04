import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getAllInventory,
  deleteInventoryItem,
} from "../../store/slices/inventorySlice";
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
  const { getAllInventoryLoading, deleteInventoryLoading } = useSelector(
    (state) => state.inventory
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [initialInventory, setInitialInventory] = useState([]);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    dispatch(getAllInventory())
      .then((data) => {
        if (data?.payload?.success) {
          setInitialInventory(data?.payload?.items);
          setInventory(data?.payload?.items);
        }
      })
      .catch((err) => {});
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
    if (
      window.confirm("Are you sure you want to delete this inventory item?")
    ) {
      setDeleteItemId(id);

      dispatch(deleteInventoryItem(id))
        .then((response) => {
          if (response?.payload?.success) {
            // Remove the deleted item from the state
            const updatedInventory = inventory.filter(
              (item) => item._id !== id
            );
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

  // return (
  //   <div className="max-w-4xl mx-auto p-6">
  //     <div className="flex flex-col gap-y-3 items-center mb-8">
  //       <h2 className="text-2xl font-bold mb-6 ">Inventory List</h2>
  //       <div className="w-full flex justify-between items-center">
  //         <Link to="/inventory">
  //           <button className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white  bg-blue-950 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
  //             Add Inventory
  //           </button>
  //         </Link>
  //         <Link to="/alertlist">
  //           <button className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white  bg-blue-950 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
  //             Alert List
  //           </button>
  //         </Link>
  //       </div>
  //     </div>

  //     <div className="">
  //       <input
  //         type="text"
  //         value={searchTerm}
  //         onChange={(e) => setSearchTerm(e.target.value)}
  //         placeholder="Search inventory items..."
  //         className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
  //       />
  //     </div>
  //     <div className="space-y-4 mt-5">
  //       {inventory?.length === 0 ? (
  //         <p className="text-gray-500 text-center">No inventory items found</p>
  //       ) : (
  //         inventory?.map((item) => (
  //           <div key={item._id} className="border rounded-lg overflow-hidden">
  //             <div
  //               className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
  //               onClick={() => toggleItemDetails(item._id)}
  //             >
  //               <div className="font-medium">{item.itemName}</div>
  //               <div className="flex space-x-4">
  //                 <span className="text-gray-600">Stock: {item.stockUnit}</span>
  //                 <span className="text-gray-600">{item.itemType}</span>
  //                 <span
  //                   className={`transform transition-transform ${
  //                     selectedItem === item._id ? "rotate-180" : ""
  //                   }`}
  //                 >
  //                   ▼
  //                 </span>
  //               </div>
  //             </div>

  //             {selectedItem === item._id && (
  //               <div className="p-4 bg-white border-t">
  //                 <div className="grid grid-cols-2 gap-4">
  //                   <div>
  //                     <h3 className="font-semibold mb-2">Details</h3>
  //                     <p>
  //                       <span className="font-medium">Volume (ML):</span>{" "}
  //                       {item.volumeML}
  //                     </p>
  //                     <p>
  //                       <span className="font-medium">Total Volume:</span>{" "}
  //                       {item.totalVolume}
  //                     </p>
  //                     <p>
  //                       <span className="font-medium">Item Type:</span>{" "}
  //                       {item.itemType}
  //                     </p>
  //                     <p>
  //                       <span className="font-medium">Recommended Doses:</span>{" "}
  //                       {item?.recommendedDoses}
  //                     </p>
  //                   </div>
  //                   <div>
  //                     <h3 className="font-semibold mb-2">Pricing</h3>
  //                     <p>
  //                       <span className="font-medium">Unit Cost:</span> $
  //                       {item.unitCostPrice}
  //                     </p>
  //                     <p>
  //                       <span className="font-medium">NGO Price:</span> $
  //                       {item.unitMinRetailPriceNGO}
  //                     </p>
  //                     <p>
  //                       <span className="font-medium">Customer Price:</span> $
  //                       {item.unitMaxRetailPriceCustomer}
  //                     </p>
  //                   </div>
  //                 </div>
  //                 <div className="flex space-x-3 mt-3">
  //                   <button
  //                     className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
  //                     onClick={(e) => {
  //                       e.stopPropagation();
  //                       handleEdit(item?._id);
  //                     }}
  //                   >
  //                     Edit Details
  //                   </button>
  //                   <button
  //                     className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
  //                     onClick={(e) => {
  //                       e.stopPropagation();
  //                       handleDelete(item?._id);
  //                     }}
  //                     disabled={deleteInventoryLoading && deleteItemId === item._id}
  //                   >
  //                     {deleteInventoryLoading && deleteItemId === item._id ? (
  //                       <span className="flex items-center">
  //                         <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
  //                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
  //                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  //                         </svg>
  //                         Deleting...
  //                       </span>
  //                     ) : (
  //                       "Delete"
  //                     )}
  //                   </button>
  //                 </div>
  //               </div>
  //             )}
  //           </div>
  //         ))
  //       )}
  //     </div>
  //   </div>
  // );
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFE3C2] to-[#85A947]/10 py-8">
      <div className="max-w-5xl mx-auto p-8">
        <div className="flex flex-col gap-y-6 items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="w-5 h-5 bg-gradient-to-r from-[#3E7B27] to-[#85A947] rounded-full"></div>
            <h2 className="text-4xl font-bold text-[#123524]">
              Inventory List
            </h2>
            <div className="w-5 h-5 bg-gradient-to-r from-[#85A947] to-[#3E7B27] rounded-full"></div>
          </div>

          <div className="w-full flex justify-between items-center">
            <Link to="/inventory">
              <button className="py-3 px-8 border-2 border-[#3E7B27] rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-[#123524] to-[#3E7B27] hover:from-[#3E7B27] hover:to-[#85A947] focus:outline-none focus:ring-4 focus:ring-[#85A947]/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  Add Inventory
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </button>
            </Link>
            <Link to="/alertlist">
              <button className="py-3 px-8 border-2 border-[#3E7B27] rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-[#123524] to-[#3E7B27] hover:from-[#3E7B27] hover:to-[#85A947] focus:outline-none focus:ring-4 focus:ring-[#85A947]/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  Alert List
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                </div>
              </button>
            </Link>
          </div>
        </div>

        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search inventory items..."
              className="w-full px-6 py-4 border-2 border-[#85A947]/30 rounded-xl shadow-lg focus:ring-4 focus:ring-[#85A947]/20 focus:border-[#3E7B27] bg-white/90 backdrop-blur-sm text-[#123524] font-medium placeholder-[#123524]/50 transition-all duration-200"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="w-6 h-6 bg-[#85A947]/20 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-[#85A947] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {inventory?.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-[#EFE3C2] rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-10 h-10 bg-[#85A947]/60 rounded-full"></div>
              </div>
              <p className="text-xl font-semibold text-[#3E7B27] mb-2">
                No inventory items found
              </p>
              <p className="text-[#123524]/60">
                Add your first inventory item to get started
              </p>
            </div>
          ) : (
            inventory?.map((item) => (
              <div
                key={item._id}
                className="bg-white/95 backdrop-blur-lg border border-[#85A947]/20 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div
                  className="p-6 bg-gradient-to-r from-[#EFE3C2]/30 to-white cursor-pointer hover:from-[#EFE3C2]/50 hover:to-[#85A947]/10 flex justify-between items-center transition-all duration-300"
                  onClick={() => toggleItemDetails(item._id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-[#3E7B27] rounded-full"></div>
                    <div className="font-bold text-[#123524] text-lg">
                      {item.itemName}
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#85A947] rounded-full"></div>
                      <span className="text-[#3E7B27] font-semibold">
                        Stock: {item.stockUnit}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#3E7B27] rounded-full"></div>
                      <span className="text-[#3E7B27] font-semibold">
                        {item.itemType}
                      </span>
                    </div>
                    <div
                      className={`w-8 h-8 bg-[#85A947]/20 rounded-full flex items-center justify-center transform transition-transform duration-300 ${
                        selectedItem === item._id ? "rotate-180" : ""
                      }`}
                    >
                      <div className="w-0 h-0 border-l-3 border-r-3 border-t-4 border-l-transparent border-r-transparent border-t-[#3E7B27]"></div>
                    </div>
                  </div>
                </div>

                {selectedItem === item._id && (
                  <div className="p-8 bg-white border-t-2 border-[#85A947]/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-3 h-3 bg-[#85A947] rounded-full"></div>
                          <h3 className="font-bold text-[#123524] text-lg">
                            Item Details
                          </h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-[#EFE3C2]/20 rounded-lg">
                            <span className="font-semibold text-[#3E7B27]">
                              Volume (ML):
                            </span>
                            <span className="font-medium text-[#123524]">
                              {item.volumeML}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-[#85A947]/10 rounded-lg">
                            <span className="font-semibold text-[#3E7B27]">
                              Total Volume:
                            </span>
                            <span className="font-medium text-[#123524]">
                              {item.totalVolume}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-[#EFE3C2]/20 rounded-lg">
                            <span className="font-semibold text-[#3E7B27]">
                              Item Type:
                            </span>
                            <span className="font-medium text-[#123524]">
                              {item.itemType}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-[#85A947]/10 rounded-lg">
                            <span className="font-semibold text-[#3E7B27]">
                              Recommended Doses:
                            </span>
                            <span className="font-medium text-[#123524]">
                              {item?.recommendedDoses}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-3 h-3 bg-[#3E7B27] rounded-full"></div>
                          <h3 className="font-bold text-[#123524] text-lg">
                            Pricing Information
                          </h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-[#EFE3C2]/20 rounded-lg">
                            <span className="font-semibold text-[#3E7B27]">
                              Unit Cost:
                            </span>
                            <span className="font-bold text-[#123524]">
                              ${item.unitCostPrice}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-[#85A947]/10 rounded-lg">
                            <span className="font-semibold text-[#3E7B27]">
                              NGO Price:
                            </span>
                            <span className="font-bold text-[#123524]">
                              ${item.unitMinRetailPriceNGO}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-[#EFE3C2]/20 rounded-lg">
                            <span className="font-semibold text-[#3E7B27]">
                              Customer Price:
                            </span>
                            <span className="font-bold text-[#123524]">
                              ${item.unitMaxRetailPriceCustomer}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center space-x-6 mt-8 pt-6 border-t border-[#85A947]/20">
                      <button
                        className="bg-gradient-to-r from-[#3E7B27] to-[#85A947] text-white px-8 py-3 rounded-xl font-bold hover:from-[#85A947] hover:to-[#3E7B27] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[#85A947]/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(item?._id);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                          Edit Details
                        </div>
                      </button>

                      <button
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item?._id);
                        }}
                        disabled={
                          deleteInventoryLoading && deleteItemId === item._id
                        }
                      >
                        {deleteInventoryLoading && deleteItemId === item._id ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Deleting...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            Delete
                          </div>
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
    </div>
  );
};

export default InventoryList;
