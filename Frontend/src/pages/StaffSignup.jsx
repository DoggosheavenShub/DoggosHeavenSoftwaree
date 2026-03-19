import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function StaffSignupPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "staff"
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/staff-signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Staff account created successfully! Please login to continue.");
        navigate("/login");
      } else {
        alert(data.message || "Failed to create account");
      }

    } catch (error) {
      console.error("Signup error:", error);
      alert("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFE3C2] to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-[#85A947] border-opacity-30">
          <h2 className="text-2xl font-bold text-[#123524] mb-6 text-center">
            Staff Registration
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#3E7B27] mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#85A947] bg-[#EFE3C2] bg-opacity-30"
                placeholder="Enter full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3E7B27] mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#85A947] bg-[#EFE3C2] bg-opacity-30"
                placeholder="Enter email address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3E7B27] mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#85A947] bg-[#EFE3C2] bg-opacity-30"
                placeholder="Enter password"
                required
                minLength="6"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-3 font-semibold text-white rounded-lg transition-all duration-300 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#123524] hover:bg-[#3E7B27]'
              }`}
            >
              {loading ? 'Creating Account...' : 'Create Staff Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-[#123524] hover:text-[#85A947] transition-colors"
            >
              Already have an account? Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}