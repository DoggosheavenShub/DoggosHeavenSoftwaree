import { BrowserRouter, Routes, Route } from "react-router-dom";
import PetForm from "./component/PetOwnerMaster/PetForm";
import Dashboard from "./component/Dashboard";
import Navbar from "./component/navbar";
import "./index.css";
import Home from "./component/home";
import DogHistory from "./component/PetOwnerMaster/DogHistory";
import InventoryForm from "./component/Inventory/inventoryForm";
import InventoryList from "./component/Inventory/inventoryList";
import EditInventory from "./component/Inventory/EditInventory";
import BreedManagement from "./component/PetOwnerMaster/BreedManagement";
import SalesSection from "./component/salesSection";
import Reminders from "./component/Reminders/Reminders";
import Attendance from "./component/Reminders/Attendance";
import AlertList from "./component/Inventory/AlertList";
import PetByDate from "./component/SalesSection/PetByDate";
import UserLoginPage from "./pages/UserLogin";
import CheckAuth from "./component/CheckAuth";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import SalesHistory from "./component/SalesSection/SalesHistory";
import NewReminders from "./component/Reminders/NewReminders";
import Inquiry from "./component/SalesSection/VisitPurpose/Inquiry";
import Veterinary from "./component/SalesSection/VisitPurpose/Veterinary";
import Hostel from "./component/SalesSection/VisitPurpose/Hostel";
import NewVisitForm from "./component/SalesSection/NewVisitForm";
import Deboard from "./component/Deboard"
import BuySubscription from "./component/SalesSection/VisitPurpose/BuySubscription";
import NewVisitForm2 from "./component/SalesSection/NewVisitForm2";
function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
 
  return (
    <div className="w-screen overflow-x-hidden">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route element={<CheckAuth isAuthenticated={isAuthenticated} />}>
            <Route path="/history" element={<DogHistory />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pet" element={<PetForm />} />
            <Route path="/inventory" element={<InventoryForm />} />
            <Route path="/inventoryList" element={<InventoryList />} />
 
            <Route path="/editinventory" element={<EditInventory />} />
            <Route path="/alertlist" element={<AlertList />} />
            <Route path="/BreedManagement" element={<BreedManagement />} />
 
            <Route path="/salesSection" element={<SalesSection />} />
            <Route path="/saleshistory" element={<SalesHistory />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/new" element={<NewReminders />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/petByDate" element={<PetByDate />} />
            <Route path="/fill" element={<Hostel />} />
            <Route path="/nvisit" element={<NewVisitForm/>}/>
            <Route path="/buysubscription" element={<BuySubscription/>}/>
            <Route path="/deboard" element={<Deboard />} />
            <Route path="/nvisit2" element={<NewVisitForm2/>}/>
          </Route>
 
          <Route element={<CheckAuth isAuthenticated={isAuthenticated} />}>
            <Route path="/login" element={<UserLoginPage />} />
          </Route>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
 
export default App;