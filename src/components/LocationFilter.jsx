import { useState } from 'react';
import { ChevronDown, ChevronRight, Check, MapPin } from 'lucide-react';

export default function LocationFilter({ hierarchy, filters, setFilters }) {
    const levels = ['Organization', 'Zone', 'State', 'Branch', 'SubBranch', 'Division'];

    // Track which level is manually expanded
    const [expandedLevel, setExpandedLevel] = useState(0);

    const getOptions = (levelIndex) => {
        if (!hierarchy || !hierarchy.Organization) return [];

        // Organization is hardcoded to BRMS
        const orgData = hierarchy.Organization;
        if (levelIndex === 0) return Object.keys(orgData);

        const parentLevel = levels[levelIndex - 1];
        const parentValue = filters[parentLevel.toLowerCase()];

        if (!parentValue) return [];

        let currentData = orgData;
        for (let i = 0; i < levelIndex; i++) {
            const levelName = levels[i].toLowerCase();
            const selectedValue = filters[levelName];

            // Defensive check for currentData and the selectedPath
            if (!currentData || !selectedValue || !currentData[selectedValue]) return [];

            currentData = currentData[selectedValue];
        }

        if (Array.isArray(currentData)) return currentData;
        return currentData ? Object.keys(currentData) : [];
    };

    const handleChange = (level, value) => {
        const levelIndex = levels.indexOf(level);
        const lowerLevel = level.toLowerCase();

        const newFilters = { ...filters, [lowerLevel]: value };
        for (let i = levelIndex + 1; i < levels.length; i++) {
            newFilters[levels[i].toLowerCase()] = '';
        }
        setFilters(newFilters);

        // Auto-expand next level if a value was selected
        if (value && levelIndex < levels.length - 1) {
            setExpandedLevel(levelIndex + 1);
        }
    };

    return (
        <div className="flex flex-col gap-2 w-full">
            {levels.map((level, index) => {
                // Skip rendering Organization level as it is hardcoded to BRMS
                if (level === 'Organization') return null;

                const options = getOptions(index);
                const value = filters[level.toLowerCase()] || '';
                const isExpanded = expandedLevel === index;
                const isDisabled = index > 0 && !filters[levels[index - 1].toLowerCase()];

                return (
                    <div key={level} className={`border rounded-xl transition-all duration-300 overflow-hidden ${isDisabled ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'
                        } ${isExpanded ? 'border-blue-200 bg-blue-50/10 ring-1 ring-blue-100/50' : 'border-gray-100 bg-white'}`}>

                        {/* Accordion Header */}
                        <button
                            onClick={() => setExpandedLevel(isExpanded ? -1 : index)}
                            disabled={isDisabled}
                            className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors ${isExpanded ? 'bg-blue-50/30' : 'hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded-lg ${value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                    {value ? <Check size={14} strokeWidth={3} /> : <MapPin size={14} />}
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{level}</p>
                                    <p className={`text-sm font-semibold ${value ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                                        {value || `Select ${level}`}
                                    </p>
                                </div>
                            </div>
                            {isExpanded ? <ChevronDown size={18} className="text-blue-500" /> : <ChevronRight size={18} className="text-gray-300" />}
                        </button>

                        {/* Accordion Body */}
                        {isExpanded && (
                            <div className="p-2 bg-white animate-in slide-in-from-top-2 duration-300">
                                <div className="max-h-48 overflow-y-auto custom-scrollbar flex flex-col gap-1">
                                    <button
                                        onClick={() => handleChange(level, '')}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all ${!value ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        -- None --
                                    </button>
                                    {options.map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => handleChange(level, opt)}
                                            className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all flex items-center justify-between ${value === opt
                                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                                : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                                                }`}
                                        >
                                            {opt}
                                            {value === opt && <Check size={12} strokeWidth={3} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
