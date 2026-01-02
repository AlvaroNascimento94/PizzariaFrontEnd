'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { api } from "@/services/api";
import { getCookieCliente } from "@/lib/cookieClient";
import { AuthContextData, Profile, User } from "@/types/types";

const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [permissionsByModule, setPermissionsByModule] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  async function loadUserPermissions() {
    try {
      const token = getCookieCliente();

      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get("/me/permissions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data.user);
      setProfile(response.data.profile);
      setPermissionsByModule(response.data.permissionsByModule);
    } catch (error) {
      console.error("Erro ao carregar permissões:", error);
    } finally {
      setLoading(false);
    }
  }

  async function refreshUser() {
    const token = getCookieCliente();

    if (!token) return;

    try {
      const response = await api.get("/me/permissions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data.user);
      setProfile(response.data.profile);
      setPermissionsByModule(response.data.permissionsByModule);
    } catch (error) {
      console.error("Erro ao atualizar dados do usuário:", error);
    }
  }

  useEffect(() => {
    loadUserPermissions();
  }, []);

  function can(systemOption: string, permission: string): boolean {
    return permissionsByModule[systemOption]?.includes(permission) || false;
  }

  const isAdmin = profile?.name?.toLowerCase() === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        permissionsByModule,
        isAdmin,
        loading,
        can,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
