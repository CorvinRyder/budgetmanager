"use client";

import moment from "moment";
import { useEffect, useState } from "react";
import styles from "./SpendingBreakdown.module.css";
import TooltipSpan from "@/components/TooltipSpan";
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
      const total = items.reduce((p, c) => (p += c.allowance), 0);
      const totalSpend = items.reduce((p, c) => (p += c.amount), 0);
      items.forEach((i) => (i.percent = i.amount / total));
      items.push({
        category: "Remaining",
        amount: total - totalSpend,
        allowance: total - totalSpend,
        rate: 0,
        percent: (total - totalSpend) / total,
      });
      console.debug(items);
      setBreakdown(items);
    });
  }, [month, updateKey]);

  return breakdown.length === 0 ? (
    <div>Loading...</div>
  ) : (
    <div className={styles.categoryBar}>
      {/* Category Bar */}
      <h3>Spending by Category</h3>
      <div className={styles.barChart}>
        {breakdown.map((i, j) => (
          <div
            key={j}
            style={{ width: `${(i.percent || 0) * 100}%` }}
            className={
              styles.barSegment +
              " " +
              ((i.rate || 0) > 1 ? styles.Over : styles.NotOver) +
              " " +
              (i.category === "Remaining" ? styles.Remaining : "")
            }
          >
            <TooltipSpan
              tooltip={`${
                i.category === "Remaining" ? "Remaining" : "Spending"
              }: $${i.amount} / $${i.allowance}`}
            >
              {i.category}
            </TooltipSpan>
          </div>
        ))}
        {/* Example bar segments — replace with dynamic data */}
      </div>
    </div>
  );
}
