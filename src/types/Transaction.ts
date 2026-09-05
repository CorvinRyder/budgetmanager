declare global {
  type Transaction = {
    trans_id?: number;
    transdate: Date;
    store: string;
    location: string;
    items: Array<TransItem>;
    receipt?: Receipt;
    total?: number;
    sale_tax?: number;
    isdraft?: boolean;
  };

  type TransItem = {
    cashflow_id?: number;
    trans_id?: number;
    amount: number;
    item: string;
    category: string;
    remark: string;
  };

  type Receipt = {
    receipt_id: number;
    trans_id?: number;
    modified_date?: Date;
    filename: string;
  };
}

export default {};
