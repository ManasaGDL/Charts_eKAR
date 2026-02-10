"use client";

import { useEffect, useState } from 'react';
import { fetchUsers, fetchFilters, fetchLocationHierarchy, fetchStructure, fetchAdminLogs, fetchAdmins } from '@/lib/api';
import FilterBar from './FilterBar';
import LocationFilter from './LocationFilter';
import ChartsContainer from './ChartsContainer';
import AdminCharts from './AdminCharts';
import StructureCharts from './StructureCharts';
import DataTable from './DataTable';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, FileText, BarChart, FileSpreadsheet, LayoutDashboard, Database, Shield, Users, Filter } from 'lucide-react';

export default function Dashboard() {
    const [users, setUsers] = useState([]);
    const [allDataForCharts, setAllDataForCharts] = useState([]);

    // Structure State
    const [structureData, setStructureData] = useState([]);
    const [structureStats, setStructureStats] = useState({ totalZones: 0, totalStates: 0, totalBranches: 0, totalStaff: 0 });
    const [structureFilters, setStructureFilters] = useState({
        organization: 'BRMS', zone: '', state: '', branch: '', subBranch: '', division: ''
    });

    // Admin State
    const [adminLogs, setAdminLogs] = useState([]);
    const [adminStats, setAdminStats] = useState({ total: 0, active: 0, regular: 0 });
    const [adminFilters, setAdminFilters] = useState({
        organization: 'BRMS', zone: '', state: '', branch: '', subBranch: '', division: '', adminType: ''
    });

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
        organization: 'BRMS',
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

    // Fetch area-specific data
    useEffect(() => {
        const loadAreaData = async () => {
            setLoading(true);
            try {
                if (activeArea === 'user') {
                    const data = await fetchUsers({ ...filters, page: meta.page, limit: 10 });
                    setUsers(data.data);
                    setMeta(data.meta);
                    const chartData = await fetchUsers({ ...filters, page: 1, limit: 1000 });
                    setAllDataForCharts(chartData.data);
                } else if (activeArea === 'structure') {
                    const data = await fetchStructure(structureFilters);
                    setStructureData(data.data);
                    setStructureStats(data.stats);
                } else if (activeArea === 'admin') {
                    const data = await fetchAdmins(adminFilters);
                    setAdminLogs(data.data);
                    setAdminStats(data.stats);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            loadAreaData();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [filters, adminFilters, structureFilters, meta.page, activeArea]);

    const getExportMetadata = () => {
        switch (activeArea) {
            case 'admin':
                return {
                    data: adminLogs,
                    filename: 'admin_report',
                    title: 'Admin Management Report',
                    columns: ["Name", "Email", "Level", "Location", "Type"],
                    mapper: (a) => [a.name, a.email, a.adminLevel, a.adminLocation, a.adminType]
                };
            case 'structure':
                return {
                    data: structureData,
                    filename: 'structure_report',
                    title: 'Organizational Structure Report',
                    columns: ["Zone", "States", "Branches", "Staff", "Status"],
                    mapper: (s) => [s.name, s.states, s.branches, s.totalStaff, s.status]
                };
            default:
                return {
                    data: allDataForCharts,
                    filename: 'user_report',
                    title: 'User Directory Report',
                    columns: ["Name", "Role", "Loc", "Zone", "Age"],
                    mapper: (u) => [u.name, u.profession, u.location || u.branch || 'N/A', u.zone || 'N/A', u.age]
                };
        }
    };

    const handleExportExcel = () => {
        const { data, filename } = getExportMetadata();
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
        XLSX.writeFile(workbook, `${filename}.xlsx`);
    };

    const handleExportPDF = () => {
        const { data, filename, title, columns, mapper } = getExportMetadata();
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(title, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        const tableRows = data.map(mapper);

        autoTable(doc, {
            head: [columns],
            body: tableRows,
            startY: 40,
        });
        doc.save(`${filename}.pdf`);
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
                            onClick={() => { setActiveArea('user'); setViewMode('dashboard'); }}
                            className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all
                                ${activeArea === 'user' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                            `}
                        >
                            <Users size={18} />
                            User Management
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
                            onClick={() => { setActiveArea('structure'); setViewMode('dashboard'); }}
                            className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all
                                ${activeArea === 'structure' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                            `}
                        >
                            <Database size={18} />
                            Structure
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

                            {/* Sidebar Layout: 30% Filter, 70% Content */}
                            <div className="flex flex-col lg:flex-row gap-8 items-start">
                                {/* Left Sidebar (Filters) - 30% */}
                                <div className="w-full lg:w-[30%] lg:sticky lg:top-6">
                                    <FilterBar
                                        filters={filters}
                                        setFilters={setFilters}
                                        options={options}
                                        locationHierarchy={locationHierarchy}
                                    />
                                </div>

                                {/* Right Content (Charts/Table) - 70% */}
                                <div className="w-full lg:w-[70%]">
                                    {loading && users.length === 0 ? (
                                        <div className="flex justify-center items-center h-64">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                                        </div>
                                    ) : (
                                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                            {viewMode === 'dashboard' ? (
                                                <ChartsContainer data={allDataForCharts} />
                                            ) : (
                                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                                    <DataTable
                                                        users={users}
                                                        meta={meta}
                                                        setPage={(page) => setMeta(prev => ({ ...prev, page }))}
                                                        total={meta.total}
                                                        onExport={handleExportExcel}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeArea === 'structure' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Structure Overview</h2>
                                    <p className="text-gray-500">Manage organizational hierarchy and geographical footprint.</p>
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

                            {/* Structure Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
                                        <Database size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Zones</p>
                                        <p className="text-2xl font-bold text-gray-900">{structureStats.totalZones}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                    <div className="p-4 bg-teal-50 text-teal-600 rounded-xl">
                                        <BarChart size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">States</p>
                                        <p className="text-2xl font-bold text-gray-900">{structureStats.totalStates}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                    <div className="p-4 bg-orange-50 text-orange-600 rounded-xl">
                                        <Download size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Branches</p>
                                        <p className="text-2xl font-bold text-gray-900">{structureStats.totalBranches}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                    <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Staff</p>
                                        <p className="text-2xl font-bold text-gray-900">{structureStats.totalStaff}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col lg:flex-row gap-8 items-start">
                                {/* Left Sidebar (Filters) - 30% */}
                                <div className="w-full lg:w-[30%] lg:sticky lg:top-6">
                                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-blue-500 rounded-lg text-white">
                                                <Filter size={20} />
                                            </div>
                                            <h2 className="text-lg font-bold text-gray-800 tracking-tight">Focus Region</h2>
                                        </div>
                                        <LocationFilter
                                            hierarchy={locationHierarchy}
                                            filters={structureFilters}
                                            setFilters={update => setStructureFilters(prev => ({ ...prev, ...update }))}
                                        />
                                        <button
                                            onClick={() => setStructureFilters({
                                                organization: 'BRMS', zone: '', state: '', branch: '', subBranch: '', division: ''
                                            })}
                                            className="w-full py-2 text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                        >
                                            Reset Region
                                        </button>
                                    </div>
                                </div>

                                {/* Right Content (Explorer / Charts) - 70% */}
                                <div className="w-full lg:w-[70%]">
                                    {loading && structureData.length === 0 ? (
                                        <div className="flex justify-center items-center h-64">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                                        </div>
                                    ) : (
                                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                            {viewMode === 'dashboard' ? (
                                                <StructureCharts data={structureData} />
                                            ) : (
                                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                                    <table className="w-full text-left">
                                                        <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                                            <tr>
                                                                <th className="p-4">Zone Name</th>
                                                                <th className="p-4 text-center">Active States</th>
                                                                <th className="p-4 text-center">Total Units</th>
                                                                <th className="p-4 text-center">Staff Count</th>
                                                                <th className="p-4">Operational Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-50 text-sm">
                                                            {structureData.map(zone => (
                                                                <tr key={zone.id} className="hover:bg-gray-50/50 transition-colors">
                                                                    <td className="p-4 font-bold text-gray-900">{zone.name}</td>
                                                                    <td className="p-4 text-center text-gray-600">{zone.states}</td>
                                                                    <td className="p-4 text-center text-gray-600">{zone.branches}</td>
                                                                    <td className="p-4 text-center font-mono text-blue-600 font-bold">{zone.totalStaff}</td>
                                                                    <td className="p-4">
                                                                        <span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-lg border border-green-100">
                                                                            {zone.status}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeArea === 'admin' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Admin Management</h2>
                                    <p className="text-gray-500">Manage admins and their hierarchy-level permissions.</p>
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

                            {/* Admin Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                    <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Admins</p>
                                        <p className="text-2xl font-bold text-gray-900">{adminStats.total}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                    <div className="p-4 bg-green-50 text-green-600 rounded-xl">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Admins</p>
                                        <p className="text-2xl font-bold text-gray-900">{adminStats.active}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
                                        <LayoutDashboard size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Regular Admins</p>
                                        <p className="text-2xl font-bold text-gray-900">{adminStats.regular}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col lg:flex-row gap-8 items-start">
                                {/* Left Sidebar (Filters) - 30% */}
                                <div className="w-full lg:w-[30%] lg:sticky lg:top-6">
                                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-indigo-500 rounded-lg text-white">
                                                <Database size={20} />
                                            </div>
                                            <h2 className="text-lg font-bold text-gray-800 tracking-tight">Hierarchy Filter</h2>
                                        </div>
                                        <LocationFilter
                                            hierarchy={locationHierarchy}
                                            filters={adminFilters}
                                            setFilters={update => setAdminFilters(prev => ({ ...prev, ...update }))}
                                        />
                                        <div className="space-y-3">
                                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin Role</h3>
                                            <select
                                                value={adminFilters.adminType}
                                                onChange={(e) => setAdminFilters(prev => ({ ...prev, adminType: e.target.value }))}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-700 appearance-none cursor-pointer"
                                            >
                                                <option value="">All Admins</option>
                                                <option value="Active Admin">Active Admin Only</option>
                                                <option value="Admin">Regular Admin Only</option>
                                            </select>
                                        </div>
                                        <button
                                            onClick={() => setAdminFilters({
                                                organization: 'BRMS', zone: '', state: '', branch: '', subBranch: '', division: '', adminType: ''
                                            })}
                                            className="w-full py-2 text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                        >
                                            Reset Filters
                                        </button>
                                    </div>
                                </div>

                                {/* Right Content (Admin List / Charts) - 70% */}
                                <div className="w-full lg:w-[70%]">
                                    {loading && adminLogs.length === 0 ? (
                                        <div className="flex justify-center items-center h-64">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                                        </div>
                                    ) : (
                                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                            {viewMode === 'dashboard' ? (
                                                <AdminCharts data={adminLogs} />
                                            ) : (
                                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                                    <table className="w-full text-left">
                                                        <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                                            <tr>
                                                                <th className="p-4">Admin Details</th>
                                                                <th className="p-4">Hierarchy Level</th>
                                                                <th className="p-4">Assigned Location</th>
                                                                <th className="p-4">Role Type</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-50 text-sm">
                                                            {adminLogs.map(admin => (
                                                                <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                                                                    <td className="p-4">
                                                                        <div className="flex flex-col">
                                                                            <span className="font-bold text-gray-900">{admin.name}</span>
                                                                            <span className="text-xs text-gray-400">{admin.email}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-4 flex items-center gap-2">
                                                                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                                                                            {admin.adminLevel}
                                                                        </span>
                                                                    </td>
                                                                    <td className="p-4 text-gray-600 font-medium">{admin.adminLocation}</td>
                                                                    <td className="p-4">
                                                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${admin.adminType === 'Active Admin' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'
                                                                            }`}>
                                                                            {admin.adminType}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                    {adminLogs.length === 0 && (
                                                        <div className="p-10 text-center text-gray-400">
                                                            No admins found for this selection.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
