"use client";

import AlertDialog from "@/components/AlertDialog";
import moment from "moment";
import { useEffect, useState } from "react";

export default function ViewTrans() {
  const [updateKey, setUpdateKey] = useState(Date.now());
  const [dialogParams, setDialogParams] = useState<AlertDialogParams>(
    {} as AlertDialogParams
  );
  const [trans, setTrans] = useState<Array<Transaction>>([]);
  useEffect(() => {
    fetch("/api/Transaction", { method: "GET" })
      .then((r) => r.json())
      .then((r) => setTrans(r));
  }, [updateKey]);
  return (
    <div>
      <AlertDialog params={dialogParams} />
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
              <td>
                {i.location ? (
                  <a
                    href={
                      i.location.startsWith("http")
                        ? i.location
                        : `https://www.google.com/maps/place/${i.location}`
                    }
                    target="_blank"
                  >
                    {i.store}
                  </a>
                ) : (
                  i.store
                )}
              </td>
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
              <td>{"$" + ((i.total || 0) + (i.sale_tax || 0)).toFixed(2)}</td>
              <td>
                <a href={`/edittrans?transid=${i.trans_id}`}>
                  <span className="material-symbols-outlined ActionBtn">
                    edit
                  </span>
                </a>
                <a
                  onClick={() => {
                    setDialogParams({
                      open: true,
                      title: "Delete Transaction",
                      content:
                        "Are you sure to delete this transaction? It can't be undone!",
                      async OnDialogOk() {
                        setDialogParams({
                          open: true,
                          title: "Saving the Transaction Record",
                          jsx: (
                            <div>
                              <span className="Loading material-symbols-outlined">
                                sync
                              </span>
                              Deleting the transaction record from the
                              database...
                            </div>
                          ),
                          noOkButton: true,
                        });
                        await fetch("/api/Transaction?transid=" + i.trans_id, {
                          method: "DELETE",
                        });
                        setDialogParams({
                          open: false,
                        });
                        setUpdateKey(Date.now());
                      },
                      OnDialogCancel() {},
                    });
                  }}
                >
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
