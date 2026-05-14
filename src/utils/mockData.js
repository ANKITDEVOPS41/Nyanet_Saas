export const mockBeneficiaries = [
  { id: "B001", name: "Kamala Devi", district: "Khordha", entitlements: { rice: 5, wheat: 2, oil: 1 }, collected: false },
  { id: "B002", name: "Ramesh Kumar", district: "Khordha", entitlements: { rice: 5, wheat: 2, oil: 1 }, collected: false },
  { id: "B003", name: "Sunita Patel", district: "Khordha", entitlements: { rice: 3, wheat: 2, oil: 1 }, collected: true },
  { id: "B004", name: "Mohan Das", district: "Puri", entitlements: { rice: 5, wheat: 3, oil: 2 }, collected: false },
  { id: "B005", name: "Lakshmi Bai", district: "Cuttack", entitlements: { rice: 5, wheat: 2, oil: 1 }, collected: false },
  { id: "B006", name: "Arjun Singh", district: "Khordha", entitlements: { rice: 4, wheat: 2, oil: 1 }, collected: false },
  { id: "B007", name: "Geeta Rani", district: "Puri", entitlements: { rice: 5, wheat: 2, oil: 1 }, collected: false },
  { id: "B008", name: "Vijay Yadav", district: "Cuttack", entitlements: { rice: 3, wheat: 1, oil: 1 }, collected: true },
];

export const mockShops = [
  { id: "S001", name: "Khordha Ward 12", lat: 20.1809, lng: 85.8316, rice: 34, wheat: 12, oil: 8, served: 34, total: 200, status: "yellow" },
  { id: "S002", name: "Bhubaneswar Central", lat: 20.2961, lng: 85.8245, rice: 78, wheat: 65, oil: 30, served: 89, total: 180, status: "green" },
  { id: "S003", name: "Puri Gate Shop", lat: 20.1967, lng: 85.8261, rice: 8, wheat: 5, oil: 3, served: 156, total: 160, status: "red" },
  { id: "S004", name: "Cuttack Road PDS", lat: 20.3167, lng: 85.8467, rice: 55, wheat: 40, oil: 20, served: 60, total: 150, status: "green" },
  { id: "S005", name: "Jatni Block Office", lat: 20.1667, lng: 85.7, rice: 15, wheat: 10, oil: 5, served: 120, total: 140, status: "red" },
  { id: "S006", name: "Chandrasekharpur", lat: 20.3333, lng: 85.7833, rice: 62, wheat: 48, oil: 25, served: 45, total: 190, status: "green" },
  { id: "S007", name: "Nayapalli PDS", lat: 20.2833, lng: 85.8, rice: 30, wheat: 22, oil: 12, served: 78, total: 170, status: "yellow" },
  { id: "S008", name: "Mancheswar Shop", lat: 20.2667, lng: 85.8667, rice: 5, wheat: 3, oil: 2, served: 180, total: 185, status: "red" },
  { id: "S009", name: "Patia Block PDS", lat: 20.35, lng: 85.8167, rice: 70, wheat: 55, oil: 28, served: 30, total: 200, status: "green" },
  { id: "S010", name: "Khandagiri PDS", lat: 20.25, lng: 85.7667, rice: 25, wheat: 18, oil: 9, served: 95, total: 160, status: "yellow" },
];

export const demoAccounts = {
  beneficiary: { email: "beneficiary@nyayanet.demo", password: "demo123", role: "beneficiary", name: "Kamala Devi" },
  shopowner: { email: "shop@nyayanet.demo", password: "demo123", role: "shopowner", name: "Khordha PDS Operator" },
  officer: { email: "officer@nyayanet.demo", password: "demo123", role: "officer", name: "District Officer" },
};

export const roleLabels = {
  beneficiary: "Beneficiary",
  shopowner: "Shop Owner",
  officer: "District Officer",
};

