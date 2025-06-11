import { TextField } from "@mui/material";
import { useEffect, useState } from "react";

type NumberFieldProps = {
  value: number;
  IsIntegerOnly?: boolean;
  onChange: (value: number) => void;
  textFieldProps: { [key: string]: unknown };
};

export default function NumberField(props: NumberFieldProps) {
  const { value, onChange, textFieldProps, IsIntegerOnly } = props;
  const [updateKey, setUpdateKey] = useState(Date.now());
  useEffect(() => {
    setUpdateKey(Date.now());
  }, [value]);

  return (
    <TextField
      key={updateKey}
      defaultValue={value}
      onBlur={(evt) => {
        const newValue = evt.target.value;
        let numValue = 0;
        if (IsIntegerOnly) numValue = parseInt(newValue);
        else numValue = parseFloat(newValue);
        if (isNaN(numValue)) numValue = 0;
        onChange(numValue);
      }}
      {...props.textFieldProps}
    />
  );
}
