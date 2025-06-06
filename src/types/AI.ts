declare global {
  type ReceiptContent = {
    store_name: string;
    date_time: Date;
    items: Array<{
      name: string;
      price: number;
      quantity: number;
    }>;
    total: number;
    sale_tax: number;
  };
}

export default {};
