declare global {
  type ReceiptContent = {
    store_name: string;
    store_addr: string;
    date_time: Date;
    items: Array<{
      name: string;
      price: number;
      quantity: number;
      remark: string;
      category: string;
    }>;
    total: number;
    sale_tax: number;
    receipt: Receipt;
  };
}

export default {};
