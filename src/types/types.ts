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


export type { OrderData, CategoryData };