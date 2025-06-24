"use client";

import moment from "moment";
import { useEffect, useState } from "react";
import Classes from "./SpendingBreakdown.module.css";
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
      console.debug(total);
      items.forEach((i) => (i.percent = i.amount / total));
      console.debug(items);
      setBreakdown(items);
    });
  }, [month, updateKey]);

  return (
    <div className={Classes.BreakdownContainer}>
      {breakdown.length === 0 ? (
        <div>Loading...</div>
      ) : (
        breakdown.map((i, j) => (
          <div
            key={j}
            style={{ width: `${(i.percent || 0) * 100}%` }}
            className={(i.rate || 0) > 1 ? Classes.over : ""}
          >
            <TooltipSpan tooltip={`Spending: $${i.amount} / $${i.allowance}`}>
              {i.category}
            </TooltipSpan>
          </div>
        ))
      )}
    </div>
  );
}
