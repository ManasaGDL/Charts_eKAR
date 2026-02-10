import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const COLORS = ['#10b981', '#6366f1']; // Green for Active, Indigo for Regular

export default function AdminCharts({ data }) {
    if (!data || data.length === 0) return (
        <div className="p-8 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-300">
            No admin data available for charts
        </div>
    );

    const typeData = [
        { name: 'Active Admin', value: data.filter(u => u.adminType === 'Active Admin').length },
        { name: 'Admin', value: data.filter(u => u.adminType === 'Admin').length },
    ];

    // Process data for location-wise distribution
    const locCounts = {};
    data.forEach(u => {
        const loc = u.zone || 'Unknown';
        locCounts[loc] = (locCounts[loc] || 0) + 1;
    });
    const locationData = Object.entries(locCounts).map(([name, value]) => ({ name, value }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-in fade-in duration-500">
            {/* Type Distribution */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
                    Admin Role Distribution
                </h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={typeData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {typeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Location Distribution */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                    Admins by Zone
                </h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={locationData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40} fill="#6366f1" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
