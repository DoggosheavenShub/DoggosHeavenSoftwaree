import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const addpet = () => navigate("/pet");
  const addinventory = () => navigate("/inventory");
  const viewlist = () => navigate("/history");
  const inventoryList = () => navigate("/inventoryList");
  const BreedManagement = () => navigate("/BreedManagement");
  const SalesSectionn = () => navigate("/petByDate");
  const AboutUs = () => navigate("/aboutus");
  const ContactUs = () => navigate("/contactus");
  const PrivacyPolicy = () => navigate("/privacypolicy");
  const RefundPolicy = () => navigate("/refundpolicy");
  const TermsAndCondition = () => navigate("/termsandcondition");

  return (
    <div className="w-screen p-6 space-y-6 bg-gradient-to-br from-white to-blue-50 min-h-screen">
     

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Pet Owner Master */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              A. Pet Owner Master
            </h2>
            <ul className="space-y-3">
              <li>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    addpet();
                  }}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <span className="text-lg">+</span>
                  <span>Quick Add</span>
                </a>
              </li>
              <li>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    viewlist();
                  }}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <span>View Complete List</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    e.preventDefault();
                    BreedManagement();
                  }}
                >
                  <span>Breed Management</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Inventory Master */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              B. Inventory Master
            </h2>
            <ul className="space-y-3">
              <li>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    addinventory();
                  }}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <span>Add New Item</span>
                </a>
              </li>
              <li>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    inventoryList();
                  }}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <span>Search Inventory</span>
                </a>
              </li>
              <li>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    inventoryList();
                  }}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <span>View All Items List</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                >
                  <span>Stock Barcoding by choice</span>
                </a>
              </li>
              <li>
                <a
                  href="alertlist"
                  className="flex items-center space-x-2 text-red-600 hover:text-red-800 ml-4"
                >
                  <span>* Alert List</span>
                </a>
              </li>
            </ul>
          </div>

          {/* organisation info pages */}

             <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              B. organisation info
            </h2>
            <ul className="space-y-3">
              <li>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    AboutUs();
                  }}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <span>About us</span>
                </a>
              </li>
              <li>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    ContactUs();
                  }}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <span>Contact us</span>
                </a>
              </li>
              <li>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    PrivacyPolicy();
                  }}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <span>Privacy policy</span>
                </a>
              </li>
              <li>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    RefundPolicy();
                  }}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <span>Refund policy</span>
                </a>
              </li>
                 <li>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    TermsAndCondition();
                  }}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <span>Terms and Condition</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Email and Card Reminders */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              C. Email and Card Reminders
            </h2>
            <ul className="space-y-3">
              {[
                "Reminder Letters",
                "Reminder Email Alerts",
                "Birthday Cards",
                "Post Obit Cards",
              ].map((item, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                  >
                    <span>{`${index + 1}. ${item}`}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* SMS Reminders Panel */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              D. Reminders Panel
            </h2>
            <ul className="space-y-3">
              {[
                { name: "Reminders Today", path: "/reminders" },
                { name: "Reminders Next Week", path: "/reminders" },
                {
                  name: "Reminders Overdue Last Week",
                  path: "/reminders",
                },
                { name: "Birthday Reminders", path: "/reminders" },
                { name: "Attendance", path: "/attendance" },
              ].map((item, index) => (
                <li key={index}>
                  <Link
                    to={item?.path}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                  >
                    <span>{`${index + 1}. ${item?.name}`}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sales Panel */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <h2
              className="text-xl font-bold mb-4 text-gray-800 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                SalesSectionn();
              }}
            >
              E. Sales Panel
            </h2>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <span>1. Today's Q</span>
                <span className="mx-2">|</span>
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  P.O.S.
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <span>2. Today's Visits</span>
                <span className="mx-2">|</span>
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  Pet Wise Visits
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <span>3. Sales Reg</span>
                <span className="mx-2">|</span>
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  Dues List
                </a>
                <span className="mx-2">|</span>
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  Sales Analysis
                </a>
              </li>
            </ul>
          </div>

          {/* Purchase Panel */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              F. Purchase Panel
            </h2>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <span>1.</span>
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  Purchase Entries
                </a>
                <span>|</span>
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  Purchase Register
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <span>2.</span>
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  Supplier Accounts
                </a>
                <span>|</span>
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  Purchase Return Reg
                </a>
              </li>
            </ul>
          </div>

          {/* Events and Tasks & Appointments */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              G. Events and Tasks
            </h2>
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              H. Appointments
            </h2>
            <p className="text-sm text-gray-600">
              Manage your schedule and appointments here.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="flex justify-end space-x-4 mt-6">
        {["Delete", "Recover Delete", "Cancel", "Revive Cancel"].map(
          (item, index) => (
            <a
              key={index}
              href="#"
              className="text-blue-600 hover:text-blue-800 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors duration-300"
            >
              {item}
            </a>
          )
        )}
      </div>
    </div>
  );
};

export default Dashboard;
