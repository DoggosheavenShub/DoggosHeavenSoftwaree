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
import AboutUs from "./pages/AboutPage";
import ContactUs from "./pages/ContactUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsAndCondition";
import RefundPolicy from "./pages/RefundPolicy";
import Footer from "./HomepageComponent/Footer";
import CustomerDashboard from "./CustomerComponent/CustomerDashboard"
import CustomerSignupPage from "./pages/Signup";
import CustomerService from "./CustomerComponent/Services/ServicePage"
import AppointmentBooking from "./CustomerComponent/Appointment/BookingForm";
import AppointmentsPage from "./CustomerComponent/Appointment/AppointmentPage";
import StaffAppointmentsPage from "./component/OnlineCustomerAppointment";
import BuySubcriptionCustomer from './CustomerComponent/subscription/BuySubscription'
import CustomerPetForm from './CustomerComponent/CustomerPetRegistration'
import CustomerSubcription from './CustomerComponent/subscription/SubcriptionsAvailable'
import ShippingPolicy from "./pages/Shippinganddelivery";
import PrescriptionForm from './component/PetOwnerMaster/PrescriptionForm'
import PetVisitCardDemo from "./CustomerComponent/Visits/ViewVisits";
import ViewAllVisits from "./CustomerComponent/Visits/ViewAllVisits";


function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
 
  return (
    <div className="w-screen overflow-x-hidden">
      <BrowserRouter>
        <Routes>
          <Route element={<CheckAuth isAuthenticated={isAuthenticated} />}>
            <Route path="/staff/history" element={<DogHistory />} />
            <Route path="/staff/dashboard" element={<Dashboard />} />
            <Route path="/staff/pet" element={<PetForm />} />
            <Route path="/staff/inventory" element={<InventoryForm />} />
            <Route path="/staff/inventoryList" element={<InventoryList />} />
 
            <Route path="/staff/editinventory" element={<EditInventory />} />
            <Route path="/staff/alertlist" element={<AlertList />} />
            <Route path="/staff/BreedManagement" element={<BreedManagement />} />
 
            <Route path="/staff/salesSection" element={<SalesSection />} />
            <Route path="/staff/saleshistory" element={<SalesHistory />} />
            <Route path="/staff/reminders" element={<NewReminders/>} />
            {/* <Route path="/new" element={<NewReminders />} /> */}
            <Route path="/staff/attendance" element={<Attendance />} />
            <Route path="/staff/petByDate" element={<PetByDate />} />

            <Route path="/staff/nvisit" element={<NewVisitForm/>}/>
            <Route path="/staff/buysubscription" element={<BuySubscription/>}/>
            <Route path="/staff/deboard" element={<Deboard />} />
            <Route path="/staff/nvisit2" element={<NewVisitForm2/>}/>
            <Route path="/staff/prescription" element={<PrescriptionForm/>}/>
            <Route path="/staff/onlinecustomerappointment" element={<StaffAppointmentsPage/>} />
            
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/bookservice" element={<CustomerService />} />
            <Route path="/customer/bookappointment" element={<AppointmentBooking />} />
            <Route path="/customer/seeappointment" element={<AppointmentsPage />} />
            <Route path="/customer/buysubscription" element={<BuySubcriptionCustomer/>} />
            <Route path="/customer/petform" element={<CustomerPetForm />} />
            <Route path="/customer/subscription" element={<CustomerSubcription />} />
            <Route path="/customer/viewvisit" element={<PetVisitCardDemo/>}/>
            <Route path="/customer/viewpetvisit/:petId" element={<ViewAllVisits/>}/>
          </Route>
 
          <Route element={<CheckAuth isAuthenticated={isAuthenticated} />}>
            <Route path="/login" element={<UserLoginPage />} />
          </Route>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<CustomerSignupPage/>}/>
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/contactus" element={<ContactUs />} />
            <Route path="/privacypolicy" element={<PrivacyPolicy />} />
            <Route path="/refundpolicy" element={<RefundPolicy />} />
            <Route path="/termsandcondition" element={<TermsConditions />} />
            <Route path="/shippingpolicy" element={<ShippingPolicy />} />

        </Routes>
     
      </BrowserRouter>
    </div>
  );
}
 
export default App;