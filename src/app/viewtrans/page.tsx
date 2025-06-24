"use client";

import AlertDialog from "@/components/AlertDialog";
import moment from "moment";
import { useEffect, useState } from "react";
import TooltipSpan from "@/components/TooltipSpan";
import Classes from "./viewtrans.module.css";
import { Button } from "@mui/material";

export default function ViewTrans() {
  const [month, setMonth] = useState(new Date());
  const [updateKey, setUpdateKey] = useState(Date.now());
  const [dialogParams, setDialogParams] = useState<AlertDialogParams>(
    {} as AlertDialogParams
  );
  const [trans, setTrans] = useState<Array<Transaction>>([]);
  useEffect(() => {
    Promise.all([
      fetch(
        `/api/Transaction?yearmonth=${moment(month).format("YYYY-MM-DD")}`,
        {
          method: "GET",
        }
      ),
      fetch(
        `/api/Transaction/MonthlyBreakdown?date=${moment(month).format(
          "YYYY-MM-DD"
        )}`,
        {
          method: "GET",
        }
      ),
    ]).then(async (r) => {
      setTrans((await r[0].json()) as Transaction[]);
    });
  }, [updateKey, month]);

  return (
    <div>
      <AlertDialog params={dialogParams} />
      <Button
        variant="contained"
        onClick={() => {
          setMonth(moment(month).add(-1, "months").toDate());
        }}
      >
        <span className="material-symbols-outlined">arrow_back</span>
      </Button>
      <span>{moment(month).format("YYYY-MM")}</span>
      <Button
        variant="contained"
        onClick={() => {
          setMonth(moment(month).add(1, "months").toDate());
        }}
      >
        <span className="material-symbols-outlined">arrow_forward</span>
      </Button>

      <table className={Classes.TransTable}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Location</th>
            <th>Receipt</th>
            <th>Items</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {trans.map((i, j) => (
            <tr key={j} className={(i.total || 0) < 0 ? Classes.MoneyGain : ""}>
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
                      <TooltipSpan tooltip={k.remark}>
                        {k.item} (${k.amount})
                      </TooltipSpan>
                    </div>
                  ))}
              </td>
              <td className={i.total ? Classes.NumberCell : ""}>
                {i.total && "$" + Math.abs(i.total).toFixed(2)}
              </td>
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
