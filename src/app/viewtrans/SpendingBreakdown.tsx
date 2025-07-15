"use client";

import moment from "moment";
import { useEffect, useState } from "react";
import styles from "./SpendingBreakdown.module.css";
import TooltipSpan from "@/components/TooltipSpan";

import ColorTransition from "@/utils/ColorTransition";

const NoOverSpend = "dcf5ff";
const OverSpend = "ffdce1";

type SpendingBreakdownProps = {
  month: Date;
  updateKey: number;
};

type BreakdownItem = {
  category: string;
  amount: number;
  allowance: number;
  rate: number;
  percent?: number;
};

export default function SpendingBreakdown(props: SpendingBreakdownProps) {
  const { month, updateKey } = props;
  const [breakdown, setBreakdown] = useState<Array<BreakdownItem>>([]);

  useEffect(() => {
    fetch(
      `/api/Transaction/MonthlyBreakdown?date=${moment(month).format(
        "YYYY-MM-DD"
      )}`,
      { method: "GET" }
    ).then(async (r) => {
      const items: Array<BreakdownItem> = await r.json();
      if (items.length === 0) {
        setBreakdown([]);
        return;
      }
      const total = items.reduce((p, c) => (p += c.allowance), 0);
      const totalSpend = items.reduce((p, c) => (p += c.amount), 0);
      items.forEach((i) => (i.percent = i.amount / total));
      items.push({
        category: "Remaining",
        amount: total - totalSpend,
        allowance: total - totalSpend,
        rate: 0,
        percent: Math.abs(total - totalSpend) / total,
      });
      console.debug(items);
      setBreakdown(items);
    });
  }, [month, updateKey]);

  return (
    <div>
      <h3>Spending by Category</h3>

      {breakdown.length === 0 ? (
        <div>No Data</div>
      ) : (
        <div className={styles.categoryBar}>
          <div className={styles.barChart}>
            {breakdown.map((i, j) => (
              <div
                key={j}
                style={{
                  width: `${(i.percent || 0) * 100}%`,
                  backgroundColor:
                    i.category !== "Remaining" && i.rate > 0.5
                      ? ColorTransition(NoOverSpend, OverSpend, i.rate * 100)
                      : "",
                }}
                className={
                  styles.barSegment +
                  " " +
                  (i.category === "Remaining"
                    ? i.amount > 0
                      ? styles.Remaining
                      : styles.OverSpent
                    : (i.rate || 0) < 0.5
                    ? styles.NotOver
                    : (i.rate || 0) > 1
                    ? styles.Over
                    : "")
                }
              >
                <TooltipSpan tooltip={`$${i.amount} / $${i.allowance}`}>
                  {i.amount > 0 ? i.category : "Overspend"}
                </TooltipSpan>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
