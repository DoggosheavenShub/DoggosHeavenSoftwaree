import { PieChart, Pie, Tooltip, Cell, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#1976D2", "#E65100"];

export default function CaseChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          outerRadius={100}
          innerRadius={50}
          paddingAngle={4}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`₹${value}`, undefined]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
