interface OrderData {
  id: string;
  price: number;
  createdAt: string;
  tables: {
    name: string;
  };
  orderStatus: {
    name: string;
  };
}
interface CategoryData {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface EmployeeData {
  id: string
  name: string
  email: string
  banner: string | null
  active: boolean
  phone: string
  accessProfile: Profile
}
interface AccessProfile {
    id: string;
    name: string;
}
interface User {
  id: string;
  name: string;
  email: string;
  banner: string | null;
  active: boolean;
}

interface Profile {
  id: string;
  name: string;
}

interface AuthContextData {
  user: User | null;
  profile: Profile | null;
  permissionsByModule: Record<string, string[]>;
  isAdmin: boolean;
  loading: boolean;
  can: (systemOption: string, permission: string) => boolean;
}

export type { OrderData, CategoryData, EmployeeData, AccessProfile, User, Profile, AuthContextData };