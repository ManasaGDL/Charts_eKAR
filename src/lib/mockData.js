// Location Hierarchy Data
export const locationHierarchy = {
    "Organization": {
        "BRMS": {
            "South": {
                "AP": {
                    "Vijayawada": {
                        "Satyanayanapuram": ["SPMD", "Sales", "Ops"],
                        "Benz Circle": ["Sales", "Marketing"],
                        "Governorpet": ["Ops", "Support"]
                    },
                    "Visakhapatnam": {
                        "Gajuwaka": ["SPMD", "Ops"],
                        "MVP Colony": ["Sales", "Marketing"]
                    },
                    "Guntur": {
                        "Arundelpet": ["Sales", "Support"],
                        "Brodipet": ["Ops", "Marketing"]
                    }
                },
                "Telangana": {
                    "Hyderabad": {
                        "Banjara Hills": ["SPMD", "Sales", "Marketing"],
                        "Jubilee Hills": ["Ops", "Finance"],
                        "Hitech City": ["Tech", "Support"]
                    },
                    "Warangal": {
                        "Kazipet": ["Sales", "Ops"],
                        "Hanamkonda": ["Marketing", "Support"]
                    }
                },
                "Karnataka": {
                    "Bangalore": {
                        "Koramangala": ["Tech", "Sales", "SPMD"],
                        "Indiranagar": ["Marketing", "Ops"],
                        "Whitefield": ["Tech", "Support"]
                    },
                    "Mysore": {
                        "Jayalakshmipuram": ["Sales", "Ops"],
                        "Gokulam": ["Marketing", "Support"]
                    }
                }
            },
            "North": {
                "Delhi": {
                    "New Delhi": {
                        "Connaught Place": ["SPMD", "Sales", "Finance"],
                        "Hauz Khas": ["Marketing", "Ops"]
                    },
                    "Noida": {
                        "Sector 18": ["Tech", "Sales"],
                        "Sector 62": ["Ops", "Support"]
                    }
                },
                "Punjab": {
                    "Chandigarh": {
                        "Sector 17": ["Sales", "Ops"],
                        "Sector 35": ["Marketing", "Support"]
                    },
                    "Amritsar": {
                        "Ranjit Avenue": ["Sales", "Marketing"],
                        "Civil Lines": ["Ops", "Support"]
                    }
                }
            }
        }
    }
};

// Helper function to get random path from hierarchy
const getRandomLocation = () => {
    const orgs = Object.keys(locationHierarchy.Organization);
    const org = orgs[Math.floor(Math.random() * orgs.length)];

    const zones = Object.keys(locationHierarchy.Organization[org]);
    const zone = zones[Math.floor(Math.random() * zones.length)];

    const states = Object.keys(locationHierarchy.Organization[org][zone]);
    const state = states[Math.floor(Math.random() * states.length)];

    const branches = Object.keys(locationHierarchy.Organization[org][zone][state]);
    const branch = branches[Math.floor(Math.random() * branches.length)];

    const subBranches = Object.keys(locationHierarchy.Organization[org][zone][state][branch]);
    const subBranch = subBranches[Math.floor(Math.random() * subBranches.length)];

    const divisions = locationHierarchy.Organization[org][zone][state][branch][subBranch];
    const division = divisions[Math.floor(Math.random() * divisions.length)];

    return { organization: org, zone, state, branch, subBranch, division };
};

// Mock Data
const professions = ['Engineer', 'Doctor', 'Artist', 'Teacher', 'Lawyer', 'Manager', 'Designer', 'Developer', 'Nurse', 'Accountant'];
const qualifications = ['High School', 'Bachelor', 'Master', 'PhD', 'Diploma'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const motherTongues = ['English', 'Spanish', 'French', 'Hindi', 'Chinese', 'German', 'Japanese', 'Tamil', 'Telugu'];
const genders = ['Male', 'Female', 'Other'];
const statuses = ['Active', 'Pending', 'Inactive'];
const adminTypes = ['Active Admin', 'Admin'];
const adminLevels = ['Organization', 'Zone', 'State', 'Branch', 'SubBranch', 'Division'];

export const generateMockUsers = (count) => {
    return Array.from({ length: count }, (_, i) => {
        const loc = getRandomLocation();
        const firstNames = ['John', 'Jane', 'Michael', 'Emma', 'David', 'Olivia', 'Chris', 'Sophia', 'Thomas', 'Isabella'];
        const lastNames = ['Smith', 'Johnson', 'Brown', 'Taylor', 'Miller', 'Wilson', 'Anderson', 'Thomas', 'Jackson', 'White'];
        const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;

        // Admin Assignment logic - approx 10% are admins
        const isAdmin = Math.random() < 0.1;
        let adminDetails = { isAdmin: false };

        if (isAdmin) {
            const level = adminLevels[Math.floor(Math.random() * adminLevels.length)];
            adminDetails = {
                isAdmin: true,
                adminType: adminTypes[Math.floor(Math.random() * adminTypes.length)],
                adminLevel: level,
                adminLocation: loc[level.toLowerCase()] || 'BRMS' // Fallback to BRMS if level is Organization
            };
        }

        return {
            id: i + 1,
            name: name,
            email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
            phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            age: Math.floor(Math.random() * 60) + 18,
            profession: professions[Math.floor(Math.random() * professions.length)],
            gender: genders[Math.floor(Math.random() * genders.length)],
            qualification: qualifications[Math.floor(Math.random() * qualifications.length)],
            bloodGroup: bloodGroups[Math.floor(Math.random() * bloodGroups.length)],
            motherTongue: motherTongues[Math.floor(Math.random() * motherTongues.length)],
            ...loc,
            ...adminDetails,
            createdAt: new Date().toISOString()
        };
    });
};

export const generateStructureData = () => {
    const zones = Object.keys(locationHierarchy.Organization.BRMS);
    return zones.map(zone => ({
        id: zone,
        name: zone,
        states: Object.keys(locationHierarchy.Organization.BRMS[zone]).length,
        totalStaff: Math.floor(Math.random() * 500) + 100,
        efficiency: `${Math.floor(Math.random() * 20) + 80}%`,
        status: 'Operational'
    }));
};

export const generateAdminLogs = (count = 20) => {
    const actions = ['Login', 'Export PDF', 'Clear Filters', 'Update Profile', 'View Report'];
    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        user: `Admin ${Math.floor(Math.random() * 5) + 1}`,
        action: actions[Math.floor(Math.random() * actions.length)],
        timestamp: new Date(Date.now() - Math.random() * 10000000).toLocaleString(),
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`
    }));
};

export const MOCK_USERS = generateMockUsers(500);
export const MOCK_STRUCTURE = generateStructureData();
export const MOCK_ADMIN_LOGS = generateAdminLogs();
