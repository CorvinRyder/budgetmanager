import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import moment from "moment";
import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

type BreakdownItem = {
  category: string;
  amount: number;
  allowance: number;
  rate: number;
  percent?: number;
};

type ChartData = {
  labels: string[];
  values: number[];
  borderColor: string[];
};

const pieColors = [
  "rgba(54, 162, 235, 0.2)",
  "rgba(255, 206, 86, 0.2)",
  "rgba(75, 192, 192, 0.2)",
  "rgba(153, 102, 255, 0.2)",
  "rgba(255, 159, 64, 0.2)",
];

const overSpentColor = "rgba(255, 99, 132, 0.7)";
const remaningColor = "rgba(99, 255, 132, 0.7)";

export default function SpendingByCategory({
  month,
  updateKey,
}: {
  month: Date;
  updateKey: number;
}) {
  const [chartData, setChartData] = useState<ChartData>();

  useEffect(() => {
    fetch(
      `/api/Transaction/MonthlyBreakdown?date=${moment(month).format(
        "YYYY-MM-DD"
      )}`,
      { method: "GET" }
    ).then(async (r) => {
      const obj = (await r.json()) as Array<BreakdownItem>;
      const borderColor: string[] = ([] as string[]).concat(pieColors);
      const labels: string[] = [];
      const values: number[] = [];
      let allowance = 0;
      let totalSpend = 0;
      obj.forEach((i, j) => {
        allowance += i.allowance || 0;
        totalSpend += i.amount || 0;
        const isOverspent = i.amount > (i.allowance || 99999);
        labels.push(i.category + (isOverspent ? " (Overspent)" : ""));
        if (isOverspent) borderColor[j] = overSpentColor;
        values.push(i.amount);
      });

      const remaining = allowance - totalSpend;
      values.push(Math.abs(remaining));
      labels.push(remaining > 0 ? "Remaining" : "Overspent");
      borderColor[values.length - 1] =
        remaining > 0 ? remaningColor : overSpentColor;

      setChartData({ labels, values, borderColor });
    });
  }, [month, updateKey]);

  return (
    <Pie
      data={{
        labels: chartData?.labels,
        datasets: [
          {
            data: chartData?.values || [],
            backgroundColor: pieColors,
            borderColor: chartData?.borderColor,
          },
        ],
      }}
      options={{
        layout: { padding: 20 },
        plugins: { legend: { position: "right" } },
        maintainAspectRatio: false,
      }}
    />
  );
}
