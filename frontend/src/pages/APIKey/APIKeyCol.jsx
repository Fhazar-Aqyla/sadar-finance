const Name = (cell) => {
  return cell.getValue() ? cell.getValue() : "";
};

const CreatedBy = (cell) => {
  return cell.getValue() ? cell.getValue() : "";
};

const APIKeys = (cell) => {
  return (
    <input type="text" className="form-control apikey-value" readOnly defaultValue={cell.getValue()} />
  );
};

const Status = (cell) => {
  switch (cell.getValue()) {
    case "Active":
      return <span className="badge bg-success-subtle text-success"> {cell.getValue()} </span>;
    case "Disable":
      return <span className="badge bg-danger-subtle text-danger"> {cell.getValue()} </span>;
    default:
      return <span className="badge bg-success-subtle text-success"> {cell.getValue()} </span>;
  }
};

const CreatedDate = (cell) => {
  return cell.getValue() ? cell.getValue() : "";
};

const ExpiryDate = (cell) => {
  return cell.getValue() ? cell.getValue() : "";
};

export { Name, CreatedBy, APIKeys, Status, CreatedDate, ExpiryDate };
