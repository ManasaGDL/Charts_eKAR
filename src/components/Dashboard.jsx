"use client";

import { useEffect, useState } from 'react';
import { fetchUsers, fetchFilters, fetchLocationHierarchy } from '@/lib/api';
import FilterBar from './FilterBar';
import ChartsContainer from './ChartsContainer';
import DataTable from './DataTable';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Download, FileText, BarChart, FileSpreadsheet, LayoutDashboard, Database, Shield, Users } from 'lucide-react';

export default function Dashboard() {
    const [users, setUsers] = useState([]);
    const [allDataForCharts, setAllDataForCharts] = useState([]);

    const [meta, setMeta] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
    const [filters, setFilters] = useState({
        name: '',
        age: '',
        profession: '',
        gender: '',
        qualification: '',
        bloodGroup: '',
        motherTongue: '',
        // Location Hierarchy
        organization: '',
        zone: '',
        state: '',
        branch: '',
        subBranch: '',
        division: ''
    });
    const [options, setOptions] = useState({});
    const [locationHierarchy, setLocationHierarchy] = useState({});
    const [loading, setLoading] = useState(true);

    // Navigation State
    const [activeArea, setActiveArea] = useState('user'); // 'structure' | 'admin' | 'user'
    const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' | 'reports'

    // Load filter options and hierarchy on mount
    useEffect(() => {
        const init = async () => {
            try {
                const [filterOpts, hierarchy] = await Promise.all([
                    fetchFilters(),
                    fetchLocationHierarchy()
                ]);
                setOptions(filterOpts);
                setLocationHierarchy(hierarchy);
            } catch (error) {
                console.error("Error loading initial data:", error);
            }
        };
        init();
    }, []);

    // Fetch data when filters or page changes (Only if in User area usually, but safe to keep running)
    useEffect(() => {
        const loadData = async () => {
            if (activeArea !== 'user') return;

            setLoading(true);
            try {
                const data = await fetchUsers({ ...filters, page: meta.page, limit: 10 });
                setUsers(data.data);
                setMeta(data.meta);

                const chartData = await fetchUsers({ ...filters, page: 1, limit: 1000 });
                setAllDataForCharts(chartData.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            loadData();
        }, 300); // Debounce

        return () => clearTimeout(timeoutId);
    }, [filters, meta.page, activeArea]);

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(allDataForCharts);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
        XLSX.writeFile(workbook, "user_report.xlsx");
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("User Report", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        const tableColumn = ["ID", "Name", "Role", "Loc", "Zone", "Age"];
        const tableRows = [];
        allDataForCharts.forEach(user => {
            const userData = [
                user.id,
                user.name,
                user.profession,
                user.location || user.branch || 'N/A',
                user.zone || 'N/A',
                user.age,
            ];
            tableRows.push(userData);
        });
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 40,
        });
        doc.save("user_report.pdf");
    };

    // Helper to render the Toggle Switch
    const ViewToggle = () => (
        <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex">
            <button
                onClick={() => setViewMode('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${viewMode === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
            >
                <LayoutDashboard size={16} />
                Dashboard
            </button>
            <button
                onClick={() => setViewMode('reports')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${viewMode === 'reports'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
            >
                <FileText size={16} />
                Reports
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Top Navigation Levels */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex justify-between items-center">
                    <nav className="flex space-x-2" aria-label="Tabs">
                        <button
                            onClick={() => { setActiveArea('structure'); setViewMode('dashboard'); }}
                            className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all
                                ${activeArea === 'structure' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                            `}
                        >
                            <Database size={18} />
                            Structure
                        </button>
                        <button
                            onClick={() => { setActiveArea('admin'); setViewMode('dashboard'); }}
                            className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all
                                ${activeArea === 'admin' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                            `}
                        >
                            <Shield size={18} />
                            Admin
                        </button>
                        <button
                            onClick={() => { setActiveArea('user'); setViewMode('dashboard'); }}
                            className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all
                                ${activeArea === 'user' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                            `}
                        >
                            <Users size={18} />
                            User Management
                        </button>
                    </nav>

                    {/* View Toggle (Dashboard vs Reports) */}
                    <ViewToggle />
                </div>

                {/* CONTENT AREA */}
                <div className="animate-in fade-in zoom-in-95 duration-300">

                    {/* --- USER AREA --- */}
                    {activeArea === 'user' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                                    <p className="text-gray-500">Analyze user distribution and generate reports.</p>
                                </div>
                                {viewMode === 'reports' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleExportExcel}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
                                        >
                                            <FileSpreadsheet size={16} />
                                            Export Excel
                                        </button>
                                        <button
                                            onClick={handleExportPDF}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
                                        >
                                            <FileText size={16} />
                                            Export PDF
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Shared Filter Bar for BOTH Dashboard and Reports */}
                            <FilterBar
                                filters={filters}
                                setFilters={setFilters}
                                options={options}
                                locationHierarchy={locationHierarchy}
                            />

                            {loading && users.length === 0 ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : (
                                <>
                                    {viewMode === 'dashboard' ? (
                                        <ChartsContainer data={allDataForCharts} />
                                    ) : (
                                        <DataTable
                                            users={users}
                                            meta={meta}
                                            setPage={(page) => setMeta(prev => ({ ...prev, page }))}
                                            total={meta.total}
                                            onExport={handleExportExcel}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* --- STRUCTURE AREA --- */}
                    {activeArea === 'structure' && (
                        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                            <Database size={48} className="mx-auto mb-4 text-indigo-200" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Structure Area</h2>
                            <p className="text-gray-500 mb-6">Manage organizational hierarchy and zones.</p>

                            {viewMode === 'dashboard' ? (
                                <div className="p-8 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                                    <h3 className="font-semibold text-gray-400">Structure Dashboard Visualization (Placeholder)</h3>
                                </div>
                            ) : (
                                <div className="p-8 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                                    <h3 className="font-semibold text-gray-400">Structure Data Table & Reports (Placeholder)</h3>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- ADMIN AREA --- */}
                    {activeArea === 'admin' && (
                        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                            <Shield size={48} className="mx-auto mb-4 text-indigo-200" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Area</h2>
                            <p className="text-gray-500 mb-6">System settings and audit logs.</p>

                            {viewMode === 'dashboard' ? (
                                <div className="p-8 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                                    <h3 className="font-semibold text-gray-400">Admin Dashboard Visualization (Placeholder)</h3>
                                </div>
                            ) : (
                                <div className="p-8 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                                    <h3 className="font-semibold text-gray-400">Admin Logs & Reports (Placeholder)</h3>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
