import { Rating, TextField } from "@mui/material";
import AlertDialog from "./AlertDialog";
import { useState } from "react";
import TooltipSpan from "./TooltipSpan";

type RatingWidgetProps = {
  transaction: Transaction;
  onChange?: (newTrans: Transaction) => void;
};

const RatingDialog = ({
  trans,
  onChange,
}: {
  trans: Transaction;
  onChange: (newV: string) => void;
}) => {
  const [tempComment, setTempComment] = useState<string>(trans.comment || "");
  return (
    <div>
      <div>
        <Rating precision={0.5} value={trans.rating || 0} />
      </div>
      <div>
        <TextField
          multiline={true}
          minRows={4}
          maxRows={4}
          defaultValue={tempComment}
          onBlur={(e) => {
            setTempComment(e.target.value);
            onChange(e.target.value);
          }}
        />
      </div>
    </div>
  );
};

export default function RatingWidget({
  transaction,
  onChange,
}: RatingWidgetProps) {
  const [dialog, setDialog] = useState<AlertDialogParams>();

  const showDialog = (newTrans: Transaction) => {
    setDialog({
      open: true,
      title: "Rate this Transaction",
      jsx: (
        <RatingDialog
          trans={newTrans}
          onChange={(newV) => {
            const trans = { ...newTrans, comment: newV };
            showDialog(trans);
          }}
        />
      ),
      OnDialogOk: async () => {
        const resp = await fetch("/api/Transaction/Rating", {
          method: "POST",
          body: JSON.stringify(newTrans),
        });
        await resp.json();
        if (resp.status === 200) {
          if (onChange) onChange(newTrans);
        }
      },
      OnDialogCancel: () => {
        if (onChange) onChange(transaction);
      },
    });
  };

  return (
    <div>
      <AlertDialog params={dialog} />
      <div className="md:block hidden">
        <Rating
          precision={0.5}
          onChange={(e, v) => {
            const newTrans = { ...transaction };
            newTrans.rating = v || 0;
            showDialog(newTrans);
          }}
          value={transaction.rating || 0}
        />
        <div>
          {transaction.comment && (
            <TooltipSpan tooltip={transaction.comment}>Comment</TooltipSpan>
          )}
        </div>
      </div>
      <div className="flex md:hidden justify-center items-center text-sm!">
        <span className="material-symbols-outlined">star </span>
        <span className="text-sm">{transaction.rating || "N/A"}</span>
      </div>
    </div>
  );
}
