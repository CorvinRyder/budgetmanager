"use client";

import AlertDialog from "@/components/AlertDialog";
import moment from "moment";
import { useEffect, useState } from "react";
import TooltipSpan from "@/components/TooltipSpan";
import styles from "./viewtrans.module.css";
import SpendingBreakdown from "./SpendingBreakdown";
import Link from "next/link";

export default function ViewTrans() {
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date());
  const [updateKey, setUpdateKey] = useState(Date.now());
  const [dialogParams, setDialogParams] = useState<AlertDialogParams>(
    {} as AlertDialogParams
  );
  const [trans, setTrans] = useState<Array<Transaction>>([]);
  useEffect(() => {
    setLoading(true);
    fetch(`/api/Transaction?yearmonth=${moment(month).format("YYYY-MM-DD")}`, {
      method: "GET",
    }).then(async (r) => {
      setTrans((await r.json()) as Transaction[]);
      setLoading(false);
    });
  }, [updateKey, month]);

  return (
    <div className={styles.dashboard}>
      <AlertDialog params={dialogParams} />
      {/* Month navigation */}
      <div className={styles.monthNav}>
        <button
          className={styles.navBtn}
          onClick={() => {
            setMonth(moment(month).add(-1, "months").toDate());
          }}
          disabled={loading}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <span className={styles.monthLabel}>
          {moment(month).format("YYYY-MM")}
        </span>
        <button
          className={styles.navBtn}
          onClick={() => {
            setMonth(moment(month).add(1, "months").toDate());
          }}
          disabled={loading}
        >
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
      <SpendingBreakdown updateKey={updateKey} month={month} />
      {loading ? (
        <div style={{ textAlign: "center" }}>
          <span className="Loading material-symbols-outlined">sync</span>
          Loading the old transaction...
        </div>
      ) : (
        <table className={styles.transactionTable}>
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
                        <TooltipSpan tooltip={k.remark}>
                          {k.item} (${k.amount})
                        </TooltipSpan>
                      </div>
                    ))}
                </td>
                <td>{i.total && "$" + Math.abs(i.total).toFixed(2)}</td>
                <td>
                  <Link href={`/edittrans?transid=${i.trans_id}`}>
                    <span className="material-symbols-outlined ActionBtn">
                      edit
                    </span>
                  </Link>
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
                          await fetch(
                            "/api/Transaction?transid=" + i.trans_id,
                            {
                              method: "DELETE",
                            }
                          );
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
      )}
    </div>
  );
}
