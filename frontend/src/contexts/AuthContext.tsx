"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserPersona {
  id: number;
  email: string;
  display_name: string;
  role: string;
  department?: string;
  state_id?: string;
  district_id?: string;
}

export const DEMO_PERSONAS: UserPersona[] = [
  {
    id: 1,
    email: "superadmin@landgov.gov.in",
    display_name: "National System Administrator",
    role: "SUPER_ADMIN",
    department: "DoLR Central Directorate",
    state_id: "ALL",
    district_id: "ALL",
  },
  {
    id: 2,
    email: "mord.secretary@landgov.gov.in",
    display_name: "MoRD Joint Secretary (PME)",
    role: "MINISTRY_OFFICIAL",
    department: "Ministry of Rural Development",
    state_id: "ALL",
    district_id: "ALL",
  },
  {
    id: 3,
    email: "state.delhi@landgov.gov.in",
    display_name: "Delhi State Revenue Secretary",
    role: "STATE_SECRETARY",
    department: "Delhi Revenue Dept",
    state_id: "DL",
    district_id: "ALL",
  },
  {
    id: 4,
    email: "dm.newdelhi@landgov.gov.in",
    display_name: "District Magistrate (New Delhi)",
    role: "DISTRICT_MAGISTRATE",
    department: "District Collectorate",
    state_id: "DL",
    district_id: "ND",
  },
  {
    id: 5,
    email: "revenue.officer@landgov.gov.in",
    display_name: "Tehsildar & Sub-Registrar",
    role: "REVENUE_OFFICER",
    department: "Tehsil Revenue Office",
    state_id: "DL",
    district_id: "ND",
  },
  {
    id: 6,
    email: "researcher@iitd.ac.in",
    display_name: "Dr. Arishta Sen (Lead Researcher)",
    role: "RESEARCHER",
    department: "IIT Delhi Geospatial AI Lab",
    state_id: "DL",
    district_id: "ND",
  },
  {
    id: 7,
    email: "citizen@bharatmail.in",
    display_name: "Rameshwar Prasad (Land Owner)",
    role: "CITIZEN",
    department: "Public Landholder",
    state_id: "DL",
    district_id: "ND",
  },
];

interface AuthContextType {
  user: UserPersona;
  switchRole: (roleName: string) => void;
  personas: UserPersona[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserPersona>(DEMO_PERSONAS[0]);

  useEffect(() => {
    const savedRole = localStorage.getItem("landgov_active_role");
    if (savedRole) {
      const found = DEMO_PERSONAS.find((p) => p.role === savedRole);
      if (found) setUser(found);
    }
  }, []);

  const switchRole = (roleName: string) => {
    const target = DEMO_PERSONAS.find((p) => p.role === roleName) || DEMO_PERSONAS[0];
    setUser(target);
    localStorage.setItem("landgov_active_role", target.role);
  };

  return (
    <AuthContext.Provider value={{ user, switchRole, personas: DEMO_PERSONAS }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
