interface OrderData {
  id: string;
  tableId: string;
  orderStatusId: string;
  waiterId: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  userCreateId: string;
  userUpdateId: string;
  tables: {
    id: string;
    name: string;
    available: boolean;
    createdAt: string;
    updatedAt: string;
  };
  orderStatus: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  waiter: {
    name: string;
    email: string;
  };
  orderProducts?: Array<{
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    description?: string;
    statusId: string; 
    createdAt: string;
    updatedAt: string;
    status: {
      id: string;
      name: string;
    };
    product: {
      id: string;
      categoryId: string;
      name: string;
      description: string;
      price: number;
      banner: string;
      status: boolean;
      userCreateId: string;
      userUpdateId: string;
      createdAt: string;
      updatedAt: string;
    };
  }>;
}
interface ProductData {
    id: string;
    categoryId: string;
    name: string;
    description: string;
    price: number;
    banner: string;
    status: boolean;
    userCreateId: string;
    userUpdateId: string;
    createdAt: string;
    updatedAt: string;
  
}
interface OrderProductData {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  description?: string;
  statusId: string;
  createdAt: string;
  updatedAt: string;
  status: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  product: {
    id: string;
    categoryId: string;
    name: string;
    description: string;
    price: number;
    banner: string;
    status: boolean;
    userCreateId: string;
    userUpdateId: string;
    createdAt: string;
    updatedAt: string;
  };
  order: {
    id: string;
    tableId: string;
    orderStatusId: string;
    waiterId: string;
    price: number;
    createdAt: string;
    updatedAt: string;
    tables: {
      id: string;
      name: string;
      available: boolean;
      createdAt: string;
      updatedAt: string;
    };
    waiter: {
      id: string;
      name: string;
      email: string;
    };
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

export type { OrderData, OrderProductData, CategoryData, EmployeeData, AccessProfile, User, Profile, AuthContextData, ProductData};