import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

export default function UsageChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(133,169,71,0.2)" />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#555" }} />
        <YAxis tick={{ fontSize: 12, fill: "#555" }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#1565C0" radius={[4, 4, 0, 0]} name="Usage Count" />
      </BarChart>
    </ResponsiveContainer>
  );
}
