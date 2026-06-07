export type BrokerStatus = "Ready for broker review" | "Broker reviewing" | "Added to policy";

export type DriverRecord = {
  id: string;
  name: string;
  dob: string;
  licenseNumber: string;
  licenseFile: string;
  brokerStatus: BrokerStatus;
  screeningStatus: string;
  notes: string;
  updatedAt: string;
};

const STORAGE_KEY = "riderOnTimeBrokerDrivers";

export const initialDrivers: DriverRecord[] = [
  {
    id: "DRV-1001",
    name: "Marcus Hill",
    dob: "03/14/1988",
    licenseNumber: "H123-456-789-001",
    licenseFile: "marcus-hill-license.jpg",
    brokerStatus: "Ready for broker review",
    screeningStatus: "Provider not connected yet",
    notes: "",
    updatedAt: "Not updated yet",
  },
  {
    id: "DRV-1002",
    name: "April Woods",
    dob: "11/02/1991",
    licenseNumber: "W987-222-451-009",
    licenseFile: "april-woods-license.jpg",
    brokerStatus: "Ready for broker review",
    screeningStatus: "Provider not connected yet",
    notes: "",
    updatedAt: "Not updated yet",
  },
  {
    id: "DRV-1003",
    name: "Tina Brooks",
    dob: "07/19/1986",
    licenseNumber: "B555-784-221-111",
    licenseFile: "tina-brooks-license.jpg",
    brokerStatus: "Ready for broker review",
    screeningStatus: "Provider not connected yet",
    notes: "",
    updatedAt: "Not updated yet",
  },
];

export function loadBrokerDrivers(): DriverRecord[] {
  if (typeof window === "undefined") {
    return initialDrivers;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDrivers));
      return initialDrivers;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as DriverRecord[];
    }
  } catch {
    // fall through to reset
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDrivers));
  return initialDrivers;
}

export function saveBrokerDrivers(drivers: DriverRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drivers));
}
