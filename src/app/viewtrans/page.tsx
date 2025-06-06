"use client";

import moment from "moment";
import { useEffect, useState } from "react";

export default function ViewTrans() {
  const [trans, setTrans] = useState<Array<Transaction>>([]);
  useEffect(() => {
    fetch("/api/Transaction", { method: "GET" })
      .then((r) => r.json())
      .then((r) => setTrans(r));
  }, []);
  return (
    <div>
      <table border={1} cellPadding={2}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Location</th>
            <th>Receipt</th>
            <th>Items</th>
            <th>Sub-total</th>
            <th>Sale Tax</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {trans.map((i, j) => (
            <tr key={j}>
              <td>{moment(i.transdate).format("YYYY-MM-DD HH:mm:ss")}</td>
              <td>{i.location}</td>
              <td>
                {i.receipt && (
                  <a href={`/receipts/${i.receipt.filename}`} target="_blank">
                    Receipt
                  </a>
                )}
              </td>
              <td>
                {i.items &&
                  i.items.map((k, l) => (
                    <div key={l}>
                      {k.item} (${k.amount})
                    </div>
                  ))}
              </td>
              <td>{i.total && "$" + i.total}</td>
              <td>{"$" + (i.sale_tax || 0)}</td>
              <td>{"$" + ((i.total || 0) + (i.sale_tax || 0))}</td>
              <td>
                <a href={`/edittrans?transid=${i.trans_id}`}>
                  <span className="material-symbols-outlined ActionBtn">
                    edit
                  </span>
                </a>
                <a href={``}>
                  <span className="material-symbols-outlined ActionBtn">
                    delete
                  </span>
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
