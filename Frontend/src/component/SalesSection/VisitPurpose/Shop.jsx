// import React from "react";
// import { useForm, useFieldArray } from "react-hook-form";
// import {addShopVisit} from "../../../store/slices/visitSlice"
// import { useDispatch } from "react-redux";

// const Shop = ({_id, priceDetail}) => {
//   const dispatch=useDispatch();

//   const { register, control, handleSubmit } = useForm({
//     defaultValues: {
//       items: [{ name: "", price: "" }],
//     },
//   });

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "items",
//   });

//   const onSubmit = (data) =>{
//     console.log(data);
//     return;
//     //dispatch(addShopVisit(data));
//   }


//   return (
//     <div className="max-w-full mx-auto p-6 bg-white shadow-lg rounded-md">
//       <form onSubmit={handleSubmit(onSubmit)}>
//         {fields.map((item, index) => (
//           <div key={item.id} className="flex items-center space-x-3 mb-3 border p-3 rounded-md bg-gray-50">
//             <input
//               {...register(`items.${index}.name`)}
//               placeholder="Item Name"
//               className="p-2 border rounded-md flex-1 focus:ring-2 focus:ring-blue-400"
//             />
//             <input
//               {...register(`items.${index}.price`)}
//               placeholder="Price"
//               type="number"
//               className="p-2 border rounded-md w-24 focus:ring-2 focus:ring-blue-400"
//             />
//             <button type="button" onClick={() => remove(index)} className="text-red-600 hover:text-red-800">
//               ✖
//             </button>
//           </div>
//         ))}
//         <button
//           type="button"
//           onClick={() => append({ name: "", price: "" })}
//           className="w-full text-center py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
//         >
//           + Add Item
//         </button>

//         <h1 className="text-lg font-bold text-gray-700 mt-4">Total Price : 500 </h1>
//         <button 
//           type="submit" 
//           className="w-full mt-4 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
//         >
//           Submit
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Shop;

import React, { useState } from "react";

const Shop = () => {
  const [items, setItems] = useState([{ name: "", price: "" }]);
  const [totalPrice, setTotalPrice] = useState(0);

  const handleChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
    calculateTotal(newItems);
  };

  const calculateTotal = (items) => {
    const total = items.reduce((acc, item) => acc + (Number(item.price) || 0), 0);
    setTotalPrice(total);
  };

  const addItem = () => {
    setItems([...items, { name: "", price: "" }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    calculateTotal(newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(items);
  };

  return (
    <div className="max-w-full mx-auto p-6 bg-white shadow-lg rounded-md">
      <form onSubmit={handleSubmit}>
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-3 mb-3 border p-3 rounded-md bg-gray-50">
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
            <button type="button" onClick={() => removeItem(index)} className="text-red-600 hover:text-red-800">
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

        <h1 className="text-lg font-bold text-gray-700 mt-4">Total Price: {totalPrice}</h1>
        <button 
          type="submit" 
          className="w-full mt-4 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Shop;
