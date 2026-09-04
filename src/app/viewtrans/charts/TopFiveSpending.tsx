import TooltipSpan from "@/components/TooltipSpan";
import moment from "moment";

export default function TopFiveSpending({ data }: { data: Transaction[] }) {
  const copyData = data.filter((i) => !i.isdraft);
  copyData.sort((a, b) => (b.total || 0) - (a.total || 0));
  if (copyData.length > 5) copyData.splice(5);
  return (
    <div className="flex flex-col size-full py-2 px-4 overflow-hidden">
      <div className="text-center text-xl font-bold">Top Five Spending</div>
      <div className="size-full flex flex-col overflow-hidden">
        {copyData.map((i, j) => (
          <div className="text-ellipsis" key={j}>
            <TooltipSpan
              tooltip={`Date: ${moment(i.transdate).format("MM-DD HH:mm:ss")}`}
            >
              ${i.total} at {i.store}
            </TooltipSpan>
          </div>
        ))}
      </div>
    </div>
  );
}
