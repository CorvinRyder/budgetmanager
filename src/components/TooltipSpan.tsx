import React, { useState } from "react";
import styles from "./TooltipSpan.module.css";

/**
 * A reusable span tooltip component.
 * @param {string} content - The text or node displayed inside the tooltip box.
 * @param {React.ReactNode} children - The trigger element/text wrapped by the tooltip.
 */
const TooltipSpan = ({
  tooltip,
  children,
}: {
  tooltip: string;
  children: React.ReactNode;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span
      className={styles.tooltipContainer}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      tabIndex={0}
      role="button"
      aria-describedby="tooltip-content"
    >
      {children}
      <span
        id="tooltip-content"
        role="tooltip"
        className={`${styles.tooltipBox} ${isVisible ? styles.visible : ""}`}
      >
        <pre>{tooltip}</pre>
      </span>
    </span>
  );
};
export default TooltipSpan;
