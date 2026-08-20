import NumberField from "@/components/NumberField";
import ComboBox from "@/components/ComboBox";
import CachedLut from "@/utils/CategoriesLut";

import { TextField, IconButton } from "@mui/material";

type ItemInputProps = {
  item: TransItem;
  onChange?: (newV: TransItem) => void;
  onDelete?: () => void;
};

export default function (props: ItemInputProps) {
  const onChangeHandler = function (newVal: string, key: keyof TransItem) {
    const newItem = { ...props.item };
    switch (key) {
      case "amount":
      case "cashflow_id":
      case "trans_id":
        return;
      default:
        newItem[key] = newVal;
    }
    if (props.onChange !== undefined) props.onChange(newItem);
  };
  return (
    <div className="flex gap-4">
      <TextField
        label="Item"
        value={props.item.item}
        onChange={(evt) => {
          onChangeHandler(evt.target.value, "item");
        }}
      />
      <NumberField
        textFieldProps={{
          label: "Amount",
        }}
        value={props.item.amount}
        onChange={(newValue) => {
          const newItem = { ...props.item };
          newItem.amount = newValue;
          if (props.onChange !== undefined) props.onChange(newItem);
        }}
      />
      <div className="w-3/12">
        <ComboBox<BudgetCategory>
          label="Category"
          options={CachedLut.categories || []}
          value={CachedLut.categoriesLut?.[props.item.category] || undefined}
          displayValue="category"
          onChange={(newValue) => {
            onChangeHandler(newValue.cat_code, "category");
          }}
        />
      </div>
      <TextField
        className="w-6/12"
        label="Remark"
        value={props.item.remark}
        onChange={(evt) => {
          onChangeHandler(evt.target.value, "remark");
        }}
      />
      <IconButton
        color="error"
        onClick={() => props.onDelete && props.onDelete()}
      >
        <span
          className="material-symbols-outlined ActionBtn"
          style={{ flex: 0.1, textAlign: "right" }}
        >
          delete
        </span>
      </IconButton>
    </div>
  );
}
