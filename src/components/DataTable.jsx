import { ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';

export default function DataTable({ users, meta, setPage, total, onExport }) {
    if (!users || users.length === 0) {
        return (
            <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100">
                <div className="text-gray-400 mb-2">No users found</div>
                <p className="text-sm text-gray-500">Try adjusting your filters</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-700">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center bg-gray-50/50">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">User Directory</h3>
                    <p className="text-sm text-gray-500 mt-1">Showing {users.length} of {total} total records</p>
                </div>
                <button
                    onClick={onExport}
                    className="mt-4 sm:mt-0 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                >
                    <FileSpreadsheet size={16} /> Export to Excel
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 text-gray-500 uppercase text-xs font-semibold tracking-wider">
                            <th className="p-4 border-b border-gray-100">#</th>
                            <th className="p-4 border-b border-gray-100">Name</th>
                            <th className="p-4 border-b border-gray-100">Age</th>
                            <th className="p-4 border-b border-gray-100">Profession</th>
                            <th className="p-4 border-b border-gray-100">Gender</th>
                            <th className="p-4 border-b border-gray-100">Qualification</th>
                            <th className="p-4 border-b border-gray-100">Blood Group</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-gray-700 text-sm">
                        {users.map((user, index) => (
                            <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                                <td className="p-4 font-medium text-gray-400">{(meta.page - 1) * meta.limit + index + 1}</td>
                                <td className="p-4 font-semibold text-gray-900">{user.name}</td>
                                <td className="p-4">{user.age}</td>
                                <td className="p-4">
                                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                        {user.profession}
                                    </span>
                                </td>
                                <td className="p-4">{user.gender}</td>
                                <td className="p-4">{user.qualification}</td>
                                <td className="p-4">
                                    <span className="font-mono text-xs">{user.bloodGroup}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="text-sm text-gray-500">
                    Page <span className="font-bold text-gray-800">{meta.page}</span> of <span className="font-bold text-gray-800">{meta.totalPages}</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage(Math.max(1, meta.page - 1))}
                        disabled={meta.page <= 1}
                        className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={() => setPage(Math.min(meta.totalPages, meta.page + 1))}
                        disabled={meta.page >= meta.totalPages}
                        className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
