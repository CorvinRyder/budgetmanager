import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import moment from "moment";
import { useEffect, useState } from "react";
import { Line, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
export default function ({
  data,
  updateKey,
  month,
}: {
  data: Transaction[];
  updateKey: number;
  month: Date;
}) {
  if (data.length === 0) return <div />;

  let dataPoint: number[] = Array.apply([], Array(31)) as number[];
  dataPoint.fill(0);

  data.forEach((i) => {
    dataPoint[new Date(i.transdate).getDate()] += i.total || 0;
  });

  let total = 0;
  for (let i = 0; i < 31; i++) {
    total += dataPoint[i] || 0;
    dataPoint[i] = total;
  }

  return (
    <Line
      data={{
        labels: Array.apply([], Array(31)).map((i, j) => j + 1),
        datasets: [
          {
            label: "Daily Spending Trend",
            data: dataPoint,
            borderColor: "rgb(53, 162, 235)",
          },
        ],
      }}
    />
  );
}
