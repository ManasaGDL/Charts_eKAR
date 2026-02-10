import { MOCK_USERS, locationHierarchy, MOCK_STRUCTURE, MOCK_ADMIN_LOGS } from './mockData';

export const fetchUsers = async (params = {}) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const {
        name,
        age,
        profession,
        gender,
        qualification,
        bloodGroup,
        motherTongue,
        organization,
        zone,
        state,
        branch,
        subBranch,
        division,
        page = 1,
        limit = 10
    } = params;

    let filteredUsers = MOCK_USERS.filter(user => {
        if (name && !user.name.toLowerCase().includes(name.toLowerCase())) return false;
        if (age && user.age !== parseInt(age)) return false;
        if (profession && !user.profession.toLowerCase().includes(profession.toLowerCase())) return false;
        if (gender && user.gender.toLowerCase() !== gender.toLowerCase()) return false;
        if (qualification && !user.qualification.toLowerCase().includes(qualification.toLowerCase())) return false;
        if (bloodGroup && user.bloodGroup !== bloodGroup) return false;
        if (motherTongue && !user.motherTongue.toLowerCase().includes(motherTongue.toLowerCase())) return false;

        // Location Hierarchy Filters
        if (organization && user.organization !== organization) return false;
        if (zone && user.zone !== zone) return false;
        if (state && user.state !== state) return false;
        if (branch && user.branch !== branch) return false;
        if (subBranch && user.subBranch !== subBranch) return false;
        if (division && user.division !== division) return false;

        return true;
    });

    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;
    const paginatedUsers = filteredUsers.slice(skip, skip + take);

    return {
        data: paginatedUsers,
        meta: {
            total: filteredUsers.length,
            page: parseInt(page),
            limit: take,
            totalPages: Math.ceil(filteredUsers.length / take)
        }
    };
};

export const fetchFilters = async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const getUnique = (key) => [...new Set(MOCK_USERS.map(u => u[key]))].sort();
    return {
        profession: getUnique('profession'),
        qualification: getUnique('qualification'),
        bloodGroup: getUnique('bloodGroup'),
        motherTongue: getUnique('motherTongue'),
        gender: getUnique('gender'),
        age: getUnique('age'),
    };
};

export const fetchLocationHierarchy = async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 50));
    return locationHierarchy;
};

export const fetchStructure = async (params = {}) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const { zone } = params;

    const brms = locationHierarchy.Organization.BRMS;
    const zones = Object.keys(brms);

    const detailedData = zones.map(z => {
        const states = Object.keys(brms[z]);
        let totalBranches = 0;
        states.forEach(s => {
            totalBranches += Object.keys(brms[z][s]).length;
        });

        return {
            id: z,
            name: z,
            states: states.length,
            branches: totalBranches,
            totalStaff: Math.floor(Math.random() * 500) + 100,
            efficiency: `${Math.floor(Math.random() * 20) + 80}%`,
            status: 'Operational'
        };
    });

    const filteredData = zone ? detailedData.filter(d => d.name === zone) : detailedData;

    // Derived stats
    const stats = {
        totalZones: zones.length,
        totalStates: detailedData.reduce((acc, curr) => acc + curr.states, 0),
        totalBranches: detailedData.reduce((acc, curr) => acc + curr.branches, 0),
        totalStaff: detailedData.reduce((acc, curr) => acc + curr.totalStaff, 0)
    };

    return {
        data: filteredData,
        stats
    };
};

export const fetchAdminLogs = async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_ADMIN_LOGS;
};

export const fetchAdmins = async (params = {}) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const { organization, zone, state, branch, subBranch, division, adminType } = params;

    let filteredAdmins = MOCK_USERS.filter(user => user.isAdmin);

    if (organization) filteredAdmins = filteredAdmins.filter(u => u.organization === organization);
    if (zone) filteredAdmins = filteredAdmins.filter(u => u.zone === zone);
    if (state) filteredAdmins = filteredAdmins.filter(u => u.state === state);
    if (branch) filteredAdmins = filteredAdmins.filter(u => u.branch === branch);
    if (subBranch) filteredAdmins = filteredAdmins.filter(u => u.subBranch === subBranch);
    if (division) filteredAdmins = filteredAdmins.filter(u => u.division === division);
    if (adminType) filteredAdmins = filteredAdmins.filter(u => u.adminType === adminType);

    const totalAdmins = filteredAdmins.length;
    const activeAdmins = filteredAdmins.filter(u => u.adminType === 'Active Admin').length;

    return {
        data: filteredAdmins,
        stats: {
            total: totalAdmins,
            active: activeAdmins,
            regular: totalAdmins - activeAdmins
        }
    };
};

export default { fetchUsers, fetchFilters, fetchLocationHierarchy, fetchStructure, fetchAdminLogs, fetchAdmins };
