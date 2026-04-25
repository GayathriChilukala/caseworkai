export interface AgencyInfo {
  code: string;
  name: string;
  short: string;
  oig: string; // Office of Inspector General designation
  color: string; // Tailwind bg class
}

export const AGENCIES: Record<string, AgencyInfo> = {
  VA: {
    code: "VA",
    name: "Department of Veterans Affairs",
    short: "VA",
    oig: "VA-OIG",
    color: "bg-blue-700",
  },
  SSA: {
    code: "SSA",
    name: "Social Security Administration",
    short: "SSA",
    oig: "SSA-OIG",
    color: "bg-green-700",
  },
  CMS: {
    code: "CMS",
    name: "Centers for Medicare & Medicaid Services",
    short: "Medicare/Medicaid",
    oig: "HHS-OIG",
    color: "bg-red-700",
  },
  IRS: {
    code: "IRS",
    name: "Internal Revenue Service",
    short: "IRS",
    oig: "TIGTA",
    color: "bg-amber-700",
  },
  USCIS: {
    code: "USCIS",
    name: "U.S. Citizenship and Immigration Services",
    short: "USCIS",
    oig: "DHS-OIG",
    color: "bg-indigo-700",
  },
  HUD: {
    code: "HUD",
    name: "Department of Housing and Urban Development",
    short: "HUD",
    oig: "HUD-OIG",
    color: "bg-orange-700",
  },
  DOL: {
    code: "DOL",
    name: "Department of Labor",
    short: "DOL",
    oig: "DOL-OIG",
    color: "bg-purple-700",
  },
  USPS: {
    code: "USPS",
    name: "U.S. Postal Service",
    short: "USPS",
    oig: "USPS-OIG",
    color: "bg-cyan-700",
  },
  OTHER: {
    code: "OTHER",
    name: "Other / Unknown",
    short: "Other",
    oig: "GAO",
    color: "bg-zinc-600",
  },
};

export function getAgency(code: string): AgencyInfo {
  return AGENCIES[code] ?? AGENCIES.OTHER;
}
