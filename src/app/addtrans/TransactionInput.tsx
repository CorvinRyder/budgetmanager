import NumberField from "@/components/NumberField";
import ComboBox from "@/components/ComboBox";
import CachedLut from "@/utils/CategoriesLut";

import { TextField, IconButton } from "@mui/material";
import AlertDialog from "@/components/AlertDialog";
import { useState } from "react";

type ItemInputProps = {
  item: TransItem;
  onChange?: (newV: TransItem) => void;
  onDelete?: () => void;
};

const InputFields = function ({
  item,
  onChangeHandler,
  onDelete,
  isAlertDialog,
}: {
  item: TransItem;
  onChangeHandler: Function;
  onDelete?: Function;
  isAlertDialog?: Boolean;
}) {
  return (
    <div className="flex basis-1/2 md:flex-nowrap flex-wrap gap-4">
      <TextField
        label="Item"
        value={item.item || ""}
        onChange={(evt) => {
          onChangeHandler(evt.target.value, "item");
        }}
      />
      <NumberField
        textFieldProps={{
          label: "Amount",
        }}
        value={item.amount}
        onChange={(newValue) => {
          onChangeHandler(newValue, "amount");
        }}
      />
      <div className="w-3/12">
        <ComboBox<BudgetCategory>
          label="Category"
          options={CachedLut.categories || []}
          value={CachedLut.categoriesLut?.[item.category] || undefined}
          displayValue="category"
          onChange={(newValue) => {
            onChangeHandler(newValue.cat_code, "category");
          }}
        />
      </div>
      <TextField
        className="w-6/12"
        label="Remark"
        value={item.remark || ""}
        onChange={(evt) => {
          onChangeHandler(evt.target.value, "remark");
        }}
      />
      {!isAlertDialog && (
        <IconButton color="error" onClick={() => onDelete && onDelete()}>
          <span
            className="material-symbols-outlined ActionBtn"
            style={{ flex: 0.1, textAlign: "right" }}
          >
            delete
          </span>
        </IconButton>
      )}
    </div>
  );
};

export default function (props: ItemInputProps) {
  const [dialogParams, setDialogParams] = useState<AlertDialogParams>();

  const onChangeHandler = function (
    newVal: string,
    key: keyof TransItem,
    targetTransItem?: TransItem
  ) {
    const newItem = { ...(targetTransItem || props.item) };
    switch (key) {
      case "cashflow_id":
      case "trans_id":
        break;
      case "amount":
        newItem["amount"] = parseFloat(newVal);
        break;
      case "item":
      case "remark":
      case "category":
        newItem[key] = newVal;
    }
    return newItem;
  };

  const openAlertDialog = function (cachedTransItem: TransItem) {
    const newTransItem = { ...cachedTransItem };
    setDialogParams({
      open: true,
      title: "Edit Item Detail",
      jsx: (
        <InputFields
          item={newTransItem}
          isAlertDialog={true}
          onChangeHandler={(val: string, key: keyof TransItem) => {
            const newItem = onChangeHandler(val, key, newTransItem);
            openAlertDialog(newItem);
          }}
        />
      ),
      OnDialogOk: () => {
        props.onChange && props.onChange(cachedTransItem);
      },
      OnDialogCancel() {},
    });
  };

  return (
    <div className="w-full">
      <AlertDialog params={dialogParams} />
      <div className="hidden md:block">
        <InputFields
          item={props.item}
          onDelete={props.onDelete}
          onChangeHandler={(val: string, key: keyof TransItem) => {
            const newItem = onChangeHandler(val, key);
            if (props.onChange !== undefined) props.onChange(newItem);
          }}
        />
      </div>
      <div className="flex md:hidden border-2 rounded-xl border-gray-300 bg-white px-4 py-2">
        <div className="flex-4">
          {props.item.item || "N/A"} (${props.item.amount || "0"}) <br />
          {CachedLut?.categoriesLut?.[props.item.category].category ||
            "Uncategorized"}{" "}
          - {props.item.remark || "N/A"}
        </div>
        <div className="flex-1 flex items-center justify-end">
          <span
            className="material-symbols-outlined text-4xl!"
            onClick={() => openAlertDialog(props.item)}
          >
            edit
          </span>{" "}
          <span className="material-symbols-outlined text-4xl! text-red-400">
            delete
          </span>
        </div>
      </div>
    </div>
  );
}
