"use client";

import moment from "moment";
import { useEffect, useState } from "react";

export default function ViewTrans() {
  const [trans, setTrans] = useState<Array<Transaction>>([]);
  useEffect(() => {
    fetch("/api/GetTrans", { method: "GET" })
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
            <th>Total</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
