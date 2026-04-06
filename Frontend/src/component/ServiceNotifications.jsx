import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const ACTION_CONFIG = {
  added:   { label: "Added",   bg: "bg-green-100",  text: "text-green-700",  icon: "➕" },
  updated: { label: "Updated", bg: "bg-yellow-100", text: "text-yellow-700", icon: "✏️" },
  deleted: { label: "Deleted", bg: "bg-red-100",    text: "text-red-700",    icon: "🗑️" },
};

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function ServiceNotifications() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const token = localStorage.getItem("authtoken");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/servicenotifications`, {
        headers: { Authorization: token || "" },
      });
      const data = await res.json();
      if (data.success) {
        setAlerts(data.alerts || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    setMarking(true);
    try {
      await fetch(`${BASE_URL}/api/v1/auth/servicenotifications/markallread`, {
        method: "PATCH",
        headers: { Authorization: token || "" },
      });
      setUnreadCount(0);
      setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
    } catch (e) { console.log(e); }
    finally { setMarking(false); }
  };

  return (
    <div className="min-h-screen bg-[#EFE3C2] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/staff/dashboard")}
            className="p-2 rounded-lg bg-white border border-[#85A947] hover:bg-[#85A947] hover:text-white transition-colors"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#123524]">Service Notifications</h1>
            <p className="text-sm text-[#3E7B27]">Staff ke service changes ka record</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              {unreadCount} unread
            </span>
          )}
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={marking}
              className="bg-[#123524] text-[#EFE3C2] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#3E7B27] transition-colors disabled:opacity-50"
            >
              {marking ? "Marking..." : "Mark All Read"}
            </button>
          )}
          <button
            onClick={load}
            className="bg-[#85A947] text-[#123524] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#EFE3C2] transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total",   value: alerts.length,                                          color: "border-[#123524]", textColor: "text-[#123524]" },
          { label: "Unread",  value: unreadCount,                                            color: "border-red-400",   textColor: "text-red-600" },
          { label: "Today",   value: alerts.filter((a) => new Date(a.alertDate).toDateString() === new Date().toDateString()).length, color: "border-[#85A947]", textColor: "text-[#3E7B27]" },
        ].map((c) => (
          <div key={c.label} className={`bg-white rounded-xl p-4 border-l-4 ${c.color} shadow-sm`}>
            <p className={`text-2xl font-bold ${c.textColor}`}>{c.value}</p>
            <p className="text-sm text-gray-500">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-[#85A947] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center shadow-sm">
          <p className="text-5xl mb-4">🔔</p>
          <p className="text-lg font-bold text-[#123524]">No Notifications Yet</p>
          <p className="text-sm text-gray-400 mt-1">Staff ke service changes yahan dikhenge</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const cfg = ACTION_CONFIG[alert.action] || ACTION_CONFIG.updated;
            return (
              <div
                key={alert._id}
                className={`bg-white rounded-xl p-4 shadow-sm border-l-4 flex items-start gap-4 transition-all ${
                  alert.isRead ? "border-gray-200 opacity-75" : "border-[#85A947]"
                }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${cfg.bg}`}>
                  {cfg.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#123524] text-sm">
                      {alert.performedBy || "Staff"}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                    <span className="text-sm text-gray-700">
                      service: <span className="font-semibold text-[#3E7B27]">"{alert.serviceName}"</span>
                    </span>
                    {!alert.isRead && (
                      <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{fmtDate(alert.alertDate)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
