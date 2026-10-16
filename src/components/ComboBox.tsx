import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useState } from "react";

declare global {
  /**
   * This type is for simple string picker
   */
  type ComboxBoxOption<T> = {
    displayValue: string;
    value: T;
  };

  type SingleValue<V> = {
    value: V;
  };
}

type ComboBoxProps<T> = {
  label: string;
  options: Array<T>;
  displayValue: keyof T;
  onChange?: (newValue: T) => void;
  value?: T;
  allowNewValue?: boolean;
  muiProps?: object | undefined;
  className?: string;
};

type NewOptionValue<T> = T & {
  isNewValue: boolean;
  _realValue: string;
};

export default function ComboBox<T>(props: ComboBoxProps<T>) {
  const filter = createFilterOptions<T>();
  const [key, setKey] = useState(Date.now());
  return (
    <Autocomplete
      className={props.className}
      key={key}
      value={props.value || null}
      onChange={(event, newV) => {
        let finalValue;
        if (newV != null && (newV as NewOptionValue<T>).isNewValue) {
          newV = (newV as NewOptionValue<T>)._realValue;
        }
        if (typeof newV === "string") {
          let value: T = null as T;
          const isExisting = props.options.some((i) => {
            const bool = i[props.displayValue] === newV;
            if (bool) value = i;
            return bool;
          });
          if (!isExisting) {
            if (!props.allowNewValue) return;
            finalValue = {
              [props.displayValue]: newV,
            } as T;
          } else {
            finalValue = value;
          }
        } else {
          finalValue = newV;
        }
        if (finalValue != null && props.onChange) {
          props.onChange(finalValue);
        }
        setKey(Date.now());
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        const { inputValue } = params;
        // Suggest the creation of a new value
        const isExisting = options.some(
          (option) => inputValue === option[props.displayValue]
        );
        if (props.allowNewValue && inputValue !== "" && !isExisting) {
          filtered.push({
            [props.displayValue]: `Press 'Enter' or click to add "${inputValue}"`,
            _realValue: inputValue,
            isNewValue: true,
          } as NewOptionValue<T>);
        }

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={props.options}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === "string") {
          return option;
        }
        // Add "xxx" option created dynamically
        // Regular option
        return option[props.displayValue] as string;
      }}
      renderOption={(props1, option) => {
        const { key, ...optionProps } = props1;
        return (
          <li
            key={key}
            {...optionProps}
            // aria-disabled={(option as NewOptionValue<T>).isNewValue}
          >
            {option[props.displayValue] as string}
          </li>
        );
      }}
      // sx={{ width: 300 }}
      freeSolo
      renderInput={(params) => <TextField {...params} label={props.label} />}
      {...props.muiProps}
    />
  );
}
