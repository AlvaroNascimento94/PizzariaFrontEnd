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


export type { OrderData };