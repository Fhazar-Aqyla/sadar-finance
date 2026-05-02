import React, { useEffect, useMemo, useState } from "react";

const formatValue = (value, decimals, separator, prefix, suffix) => {
  const fixedValue = Number(value).toFixed(decimals);
  const [integerPart, decimalPart] = fixedValue.split(".");
  const groupedInteger = separator
    ? integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    : integerPart;

  return `${prefix || ""}${groupedInteger}${decimalPart ? `.${decimalPart}` : ""}${suffix || ""}`;
};

const CountUp = ({
  start = 0,
  end = 0,
  duration = 2,
  decimals,
  decimal,
  separator = "",
  prefix = "",
  suffix = "",
}) => {
  const decimalPlaces = useMemo(() => decimals ?? decimal ?? 0, [decimal, decimals]);
  const [value, setValue] = useState(start);

  useEffect(() => {
    let animationFrame;
    const startTime = performance.now();
    const durationMs = duration * 1000;
    const from = Number(start) || 0;
    const to = Number(end) || 0;

    const updateValue = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = durationMs > 0 ? Math.min(elapsed / durationMs, 1) : 1;
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setValue(from + (to - from) * easedProgress);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateValue);
      }
    };

    animationFrame = requestAnimationFrame(updateValue);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [duration, end, start]);

  return formatValue(value, decimalPlaces, separator, prefix, suffix);
};

export default CountUp;
