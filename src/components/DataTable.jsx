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
            <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center bg-gray-50/50 gap-2">
                <div className="text-center sm:text-left">
                    <h3 className="text-lg font-bold text-gray-800">User Directory</h3>
                    <p className="text-sm text-gray-500 mt-1">Showing {users.length} of {total} total records</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 text-gray-500 uppercase text-[10px] font-bold tracking-widest border-b border-gray-100">
                            <th className="p-4">#</th>
                            <th className="p-4">User Details</th>
                            <th className="p-4">Demographics</th>
                            <th className="p-4">Location Hierarchy</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-gray-700 text-sm">
                        {users.map((user, index) => (
                            <tr key={user.id} className="hover:bg-gray-50/80 transition-colors group">
                                <td className="p-4 font-medium text-gray-400">{(meta.page - 1) * meta.limit + index + 1}</td>
                                <td className="p-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{user.name}</span>
                                        <span className="text-xs text-gray-400">{user.email}</span>
                                        <span className="text-[10px] text-gray-300">{user.phone}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                                                {user.profession}
                                            </span>
                                            <span className="text-gray-400 text-xs">{user.gender}</span>
                                        </div>
                                        <div className="text-[10px] text-gray-500 flex gap-2">
                                            <span>Age: <b className="text-gray-700">{user.age}</b></span>
                                            <span>Bldg: <b className="text-gray-700">{user.bloodGroup}</b></span>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="text-[11px] space-y-0.5">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                            <span className="text-gray-600 font-medium">{user.zone} / {user.state}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 pl-3">
                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                            <span className="text-gray-400">{user.branch} - {user.subBranch}</span>
                                        </div>
                                        <div className="pl-3 text-[10px] font-bold text-gray-300/80">{user.division}</div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${user.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' :
                                        user.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                            'bg-red-50 text-red-700 border-red-100'
                                        }`}>
                                        {user.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-3 md:p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="text-xs md:text-sm text-gray-500">
                    Page <span className="font-bold text-gray-800">{meta.page}</span> of <span className="font-bold text-gray-800">{meta.totalPages}</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage(Math.max(1, meta.page - 1))}
                        disabled={meta.page <= 1}
                        className="p-1.5 md:p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={() => setPage(Math.min(meta.totalPages, meta.page + 1))}
                        disabled={meta.page >= meta.totalPages}
                        className="p-1.5 md:p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div >
    );
}
