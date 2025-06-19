import Styles from "./TooltipSpan.module.css";
import { ReactNode } from "react";
type ToolTipSpanProps = {
  tooltip: string;
  children?: ReactNode;
};

const TooltipSpan = function (props: ToolTipSpanProps) {
  return (
    <span
      className={`${!!props.tooltip ? Styles.tooltip : ""}`}
      data-tooltip={props.tooltip}
    >
      {props.children}
    </span>
  );
};

export default TooltipSpan;
