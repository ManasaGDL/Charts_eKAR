import { useState, useEffect } from 'react';

export default function LocationFilter({ hierarchy, filters, setFilters }) {
    // Hierarchy Levels
    const levels = ['Organization', 'Zone', 'State', 'Branch', 'SubBranch', 'Division'];

    // Helper to get options for a specific level based on parent selections
    const getOptions = (levelIndex) => {
        if (levelIndex === 0) return Object.keys(hierarchy?.Organization || {});

        const parentLevel = levels[levelIndex - 1];
        const parentValue = filters[parentLevel.toLowerCase()]; // e.g., 'South' for Zone

        if (!parentValue) return [];

        // Traverse down to the current level
        let currentData = hierarchy.Organization;
        for (let i = 0; i < levelIndex; i++) {
            const levelName = levels[i].toLowerCase(); // organization, zone, state...
            const selectedValue = filters[levelName];    // BRMS, South, AP...

            if (!selectedValue || !currentData[selectedValue]) return [];
            currentData = currentData[selectedValue];
        }

        // If it's the last level (Division list), it's an array
        if (Array.isArray(currentData)) {
            return currentData;
        }

        return Object.keys(currentData);
    };

    const handleChange = (level, value) => {
        const levelIndex = levels.indexOf(level);
        const lowerLevel = level.toLowerCase(); // organization

        // Update the specific filter
        const newFilters = { ...filters, [lowerLevel]: value };

        // Clear all child levels
        for (let i = levelIndex + 1; i < levels.length; i++) {
            newFilters[levels[i].toLowerCase()] = '';
        }

        setFilters(newFilters);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
            {levels.map((level, index) => {
                const options = getOptions(index);
                const isDisabled = index > 0 && !filters[levels[index - 1].toLowerCase()];
                const value = filters[level.toLowerCase()] || '';

                return (
                    <div key={level} className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {level}
                        </label>
                        <select
                            value={value}
                            onChange={(e) => handleChange(level, e.target.value)}
                            disabled={isDisabled}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-700 disabled:opacity-50 disabled:bg-gray-100"
                        >
                            <option value="">-- Select {level} --</option>
                            {options.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>
                );
            })}
        </div>
    );
}
