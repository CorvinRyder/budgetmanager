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
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
export default function DailySpendingTrend({
  data,
}: {
  data: Transaction[];
  updateKey: number;
  month: Date;
}) {
  if (data.length === 0) return <div />;

  const dataPoint: number[] = Array.apply([], Array(31)) as number[];
  dataPoint.fill(0);

  data.forEach((i) => {
    if (!i.isdraft)
      dataPoint[new Date(i.transdate).getDate() - 1] += i.total || 0;
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
            borderColor: "#0891B2",
          },
        ],
      }}
    />
  );
}
