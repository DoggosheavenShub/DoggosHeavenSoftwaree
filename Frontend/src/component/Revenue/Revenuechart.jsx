import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

export default function RevenueChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(133,169,71,0.2)" />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#555" }} />
        <YAxis tick={{ fontSize: 12, fill: "#555" }} />
        <Tooltip
          contentStyle={{ borderRadius: "10px", border: "1px solid rgba(133,169,71,0.3)" }}
          formatter={(value) => [`₹${value}`, undefined]}
        />
        <Legend />
        <Line type="monotone" dataKey="revenue" stroke="#2E7D32" strokeWidth={2} dot={{ r: 3 }} name="Revenue" />
        <Line type="monotone" dataKey="profit"  stroke="#E65100" strokeWidth={2} dot={{ r: 3 }} name="Profit" />
      </LineChart>
    </ResponsiveContainer>
  );
}
