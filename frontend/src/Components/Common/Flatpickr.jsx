import React from "react";
import FlatpickrModule from "react-flatpickr-original";

const FlatpickrComponent = FlatpickrModule?.default ?? FlatpickrModule;

const Flatpickr = React.forwardRef((props, ref) => {
  if (!FlatpickrComponent || typeof FlatpickrComponent !== "function") {
    return null;
  }

  return <FlatpickrComponent ref={ref} {...props} />;
});

Flatpickr.displayName = "Flatpickr";

export default Flatpickr;
