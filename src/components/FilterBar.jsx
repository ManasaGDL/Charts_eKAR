import { useState } from 'react';
import { Search, Plus, X, Filter } from 'lucide-react';
import LocationFilter from './LocationFilter';

export default function FilterBar({ filters, setFilters, options, locationHierarchy }) {
    const [activeField, setActiveField] = useState('');
    const [activeValue, setActiveValue] = useState('');

    const fieldLabels = {
        age: 'Age',
        profession: 'Profession',
        gender: 'Gender',
        bloodGroup: 'Blood Group',
        qualification: 'Qualification',
        motherTongue: 'Mother Tongue'
    };

    const handleAddField = () => {
        if (activeField && activeValue) {
            setFilters(prev => ({ ...prev, [activeField]: activeValue }));
            setActiveValue('');
            // Keep activeField selected for easy changing, or reset? Reset is cleaner.
            setActiveField('');
        }
    };

    const removeFilter = (key) => {
        setFilters(prev => ({ ...prev, [key]: '' }));
    };

    const availableOptions = activeField ? options[activeField] : [];

    return (
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500 rounded-lg text-white">
                        <Filter size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800 tracking-tight">Filter Data</h2>
                </div>

                {/* Location Hierarchy Filter */}
                <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location Hierarchy</h3>
                    <LocationFilter
                        hierarchy={locationHierarchy}
                        filters={filters}
                        setFilters={update => setFilters(prev => ({ ...prev, ...update }))}
                    />
                </div>

                <div className="h-px bg-gray-100"></div>

                {/* Dynamic Filter Controls - Stacked for Sidebar */}
                <div className="flex flex-col gap-4">
                    <div className="w-full relative group">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Attribute</label>
                        <select
                            value={activeField}
                            onChange={(e) => { setActiveField(e.target.value); setActiveValue(''); }}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-700 appearance-none cursor-pointer"
                        >
                            <option value="">-- Select Field --</option>
                            {Object.entries(fieldLabels).map(([key, label]) => (
                                <option key={key} value={key} disabled={filters[key] !== ''}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full relative group">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Value</label>
                        <select
                            value={activeValue}
                            onChange={(e) => setActiveValue(e.target.value)}
                            disabled={!activeField}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-700 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="">-- Select Value --</option>
                            {availableOptions?.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleAddField}
                        disabled={!activeField || !activeValue}
                        className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        <Plus size={16} /> Add Filter
                    </button>
                </div>

                {/* Active Filters Display */}
                <div className="flex flex-col gap-2 mt-2">
                    {Object.entries(filters).some(([key, value]) => value && !['organization', 'zone', 'state', 'branch', 'subBranch', 'division'].includes(key)) && (
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Applied</span>
                    )}
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(filters).map(([key, value]) => {
                            if (!value || ['organization', 'zone', 'state', 'branch', 'subBranch', 'division'].includes(key)) return null;
                            return (
                                <div key={key} className="flex items-center gap-2 pl-2.5 pr-1.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-medium animate-in zoom-in duration-300">
                                    <span className="font-bold">{value}</span>
                                    <button
                                        onClick={() => removeFilter(key)}
                                        className="p-1 hover:bg-indigo-100 rounded-md transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {Object.values(filters).some(v => v) && (
                        <button
                            onClick={() => setFilters({
                                name: '', age: '', profession: '', gender: '',
                                qualification: '', bloodGroup: '', motherTongue: '',
                                organization: 'BRMS', zone: '', state: '', branch: '', subBranch: '', division: ''
                            })}
                            className="mt-2 w-full py-2 text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                        >
                            Reset All Filters
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
