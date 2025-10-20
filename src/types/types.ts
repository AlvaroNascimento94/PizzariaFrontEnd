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
  accessProfile: {
    id: string
    name: string
  }
}
interface AccessProfile {
    id: string;
    name: string;
}


export type { OrderData, CategoryData, EmployeeData, AccessProfile };