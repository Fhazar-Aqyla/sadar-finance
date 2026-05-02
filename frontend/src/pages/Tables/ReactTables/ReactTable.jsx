import React, { useEffect, useMemo, useState } from 'react';
import TableContainer from "../../../Components/Common/TableContainerReactTable";
import { Link } from 'react-router-dom';
import { Spinner } from 'reactstrap';

const DefaultTable = () => {
  const defaultTable =
    [
      { id: "10", name: "Tyrone", email: "tyrone@example.com", designation: "Senior Response Liaison", company: "Raynor, Rolfson and Daugherty", location: "Qatar" },
      { id: "09", name: "Cathy", email: "cathy@example.com", designation: "Customer Data Director", company: "Ebert, Schamberger and Johnston", location: "Mexico" },
      { id: "08", name: "Patsy", email: "patsy@example.com", designation: "Dynamic Assurance Director", company: "Streich Group", location: "Niue" },
      { id: "07", name: "Kerry", email: "kerry@example.com", designation: "Lead Applications Associate", company: "Feeney, Langworth and Tremblay", location: "Niger" },
      { id: "06", name: "Traci", email: "traci@example.com", designation: "Corporate Identity Director", company: "Koelpin - Goldner", location: "Vanuatu" },
      { id: "05", name: "Noel", email: "noel@example.com", designation: "Customer Data Director", company: "Howell - Rippin", location: "Germany" },
      { id: "04", name: "Robert", email: "robert@example.com", designation: "Product Accounts Technician", company: "Hoeger", location: "San Marino" },
      { id: "03", name: "Shannon", email: "shannon@example.com", designation: "Legacy Functionality Associate", company: "Zemlak Group", location: "South Georgia" },
      { id: "02", name: "Harold", email: "harold@example.com", designation: "Forward Creative Coordinator", company: "Metz Inc", location: "Iran" },
      { id: "01", name: "Jonathan", email: "jonathan@example.com", designation: "Senior Implementation Architect", company: "Hauck Inc", location: "Holy See" }
    ];
  const columns = useMemo(
    () => [
      {
        header: "ID",
        cell: (cell) => {
          return (
            <span className="fw-semibold">{cell.getValue()}</span>
          );
        },
        accessorKey: "id",
        enableColumnFilter: false,
      },

      {
        header: "Name",
        accessorKey: "name",
        enableColumnFilter: false,
      },
      {
        header: "Email",
        accessorKey: "email",
        enableColumnFilter: false,
      },
      {
        header: "Designation",
        accessorKey: "designation",
        enableColumnFilter: false,
      },
      {
        header: "Company",
        accessorKey: "company",
        enableColumnFilter: false,
      },
      {
        header: "Location",
        accessorKey: "location",
        enableColumnFilter: false,
      }
    ],
    []
  );

  return (
    <React.Fragment>
      <TableContainer
        columns={(columns || [])}
        data={(defaultTable || [])}
        customPageSize={5}
        SearchPlaceholder='Search...'
      />
    </React.Fragment>
  );
};

const PaginationTable = () => {
  const paginationTable =
    [{ id: "#VL2111", name: "Jonathan", date: "07 Oct, 2021", total: "$24.05", status: "Paid" },
    { id: "#VL2110", name: "Harold", date: "07 Oct, 2021", total: "$26.15", status: "Paid" },
    { id: "#VL2109", name: "Shannon", date: "06 Oct, 2021", total: "$21.25", status: "Refund" },
    { id: "#VL2108", name: "Robert", date: "05 Oct, 2021", total: "$25.03", status: "Paid" },
    { id: "#VL2107", name: "Noel", date: "05 Oct, 2021", total: "$22.61", status: "Paid" },
    { id: "#VL2106", name: "Traci", date: "04 Oct, 2021", total: "$24.05", status: "Paid" },
    { id: "#VL2105", name: "Kerry", date: "04 Oct, 2021", total: "$26.15", status: "Paid" },
    { id: "#VL2104", name: "Patsy", date: "04 Oct, 2021", total: "$21.25", status: "Refund" },
    { id: "#VL2103", name: "Cathy", date: "03 Oct, 2021", total: "$22.61", status: "Paid" },
    { id: "#VL2102", name: "Tyrone", date: "03 Oct, 2021", total: "$25.03", status: "Paid" }];

  const columns = useMemo(
    () => [
      {
        header: "ID",
        cell: (cell) => {
          return (
            <Link to="#" className="fw-medium">{cell.getValue()}</Link>
          );
        },
        accessorKey: "id",
        enableColumnFilter: false,
      },

      {
        header: "Name",
        accessorKey: "name",
        enableColumnFilter: false,
      },
      {
        header: "Date",
        accessorKey: "date",
        enableColumnFilter: false,
      },
      {
        header: "Total",
        accessorKey: "total",
        enableColumnFilter: false,
      },
      {
        header: "Status",
        enableColumnFilter: false,
        accessorKey: "status",
        cell: (cell) => {
          switch (cell.getValue()) {
            case "Paid":
              return (<span className="badge bg-success-subtle text-success text-uppercase"> {cell.getValue()}</span>);
            case "Refund":
              return (<span className="badge bg-warning-subtle  text-warning text-uppercase"> {cell.getValue()}</span>);
            default:
              return (<span className="badge bg-danger-subtle  text-danger text-uppercase"> {cell.getValue()}</span>);
          }
        },
      },
      {
        header: "Actions",
        enableColumnFilter: false,
        cell: (cell) => {
          return (
            <React.Fragment>
              Details
            </React.Fragment>
          );
        },
      },
    ],
    []
  );

  return (
    <React.Fragment >
      <TableContainer
        columns={(columns || [])}
        data={(paginationTable || [])}
        customPageSize={5}
        tableClass="table-centered align-middle table-nowrap mb-0"
        theadClass="text-muted table-light"
        SearchPlaceholder='Search Products...'
      />
    </React.Fragment >
  );
};

const SearchTable = () => {
  const searchTable =
    [
      { id: "10", name: "Tyrone", email: "tyrone@example.com", designation: "Senior Response Liaison", company: "Raynor, Rolfson and Daugherty", location: "Qatar" },
      { id: "09", name: "Cathy", email: "cathy@example.com", designation: "Customer Data Director", company: "Ebert, Schamberger and Johnston", location: "Mexico" },
      { id: "08", name: "Patsy", email: "patsy@example.com", designation: "Dynamic Assurance Director", company: "Streich Group", location: "Niue" },
      { id: "07", name: "Kerry", email: "kerry@example.com", designation: "Lead Applications Associate", company: "Feeney, Langworth and Tremblay", location: "Niger" },
      { id: "06", name: "Traci", email: "traci@example.com", designation: "Corporate Identity Director", company: "Koelpin - Goldner", location: "Vanuatu" },
      { id: "05", name: "Noel", email: "noel@example.com", designation: "Customer Data Director", company: "Howell - Rippin", location: "Germany" },
      { id: "04", name: "Robert", email: "robert@example.com", designation: "Product Accounts Technician", company: "Hoeger", location: "San Marino" },
      { id: "03", name: "Shannon", email: "shannon@example.com", designation: "Legacy Functionality Associate", company: "Zemlak Group", location: "South Georgia" },
      { id: "02", name: "Harold", email: "harold@example.com", designation: "Forward Creative Coordinator", company: "Metz Inc", location: "Iran" },
      { id: "01", name: "Jonathan", email: "jonathan@example.com", designation: "Senior Implementation Architect", company: "Hauck Inc", location: "Holy See" }
    ];

  const columns = useMemo(
    () => [
      {
        header: "ID",
        cell: (cell) => {
          return (
            <span className="fw-semibold">{cell.getValue()}</span>
          );
        },
        accessorKey: "id",
        enableColumnFilter: false,
      },

      {
        header: "Name",
        accessorKey: "name",
        enableColumnFilter: false,
      },
      {
        header: "Email",
        accessorKey: "email",
        enableColumnFilter: false,
      },
      {
        header: "Designation",
        accessorKey: "designation",
        enableColumnFilter: false,
      },
      {
        header: "Company",
        accessorKey: "company",
        enableColumnFilter: false,
      },
      {
        header: "Location",
        accessorKey: "location",
        enableColumnFilter: false,
      }
    ],
    []
  );

  return (
    <React.Fragment >
      <TableContainer
        columns={(columns || [])}
        data={(searchTable || [])}
        isGlobalFilter={true}
        customPageSize={5}
        SearchPlaceholder='Search...'
      />
    </React.Fragment >
  );
};

const SortingTable = () => {
  const sortingTable =
    [
      { id: "10", name: "Tyrone", email: "tyrone@example.com", designation: "Senior Response Liaison", company: "Raynor, Rolfson and Daugherty", location: "Qatar" },
      { id: "09", name: "Cathy", email: "cathy@example.com", designation: "Customer Data Director", company: "Ebert, Schamberger and Johnston", location: "Mexico" },
      { id: "08", name: "Patsy", email: "patsy@example.com", designation: "Dynamic Assurance Director", company: "Streich Group", location: "Niue" },
      { id: "07", name: "Kerry", email: "kerry@example.com", designation: "Lead Applications Associate", company: "Feeney, Langworth and Tremblay", location: "Niger" },
      { id: "06", name: "Traci", email: "traci@example.com", designation: "Corporate Identity Director", company: "Koelpin - Goldner", location: "Vanuatu" },
      { id: "05", name: "Noel", email: "noel@example.com", designation: "Customer Data Director", company: "Howell - Rippin", location: "Germany" },
      { id: "04", name: "Robert", email: "robert@example.com", designation: "Product Accounts Technician", company: "Hoeger", location: "San Marino" },
      { id: "03", name: "Shannon", email: "shannon@example.com", designation: "Legacy Functionality Associate", company: "Zemlak Group", location: "South Georgia" },
      { id: "02", name: "Harold", email: "harold@example.com", designation: "Forward Creative Coordinator", company: "Metz Inc", location: "Iran" },
      { id: "01", name: "Jonathan", email: "jonathan@example.com", designation: "Senior Implementation Architect", company: "Hauck Inc", location: "Holy See" }
    ];

  const columns = useMemo(
    () => [
      {
        header: "Name",
        accessorKey: "name",
        enableColumnFilter: false,
      },
      {
        header: "Email",
        accessorKey: "email",
        enableColumnFilter: false,
      },
      {
        header: "Designation",
        accessorKey: "designation",
        enableColumnFilter: false,
      },
      {
        header: "Company",
        accessorKey: "company",
        enableColumnFilter: false,
      },
      {
        header: "Location",
        accessorKey: "location",
        enableColumnFilter: false,
      }
    ],
    []
  );

  return (
    <React.Fragment >
      <TableContainer
        columns={(columns || [])}
        data={(sortingTable || [])}
        customPageSize={5}
        SearchPlaceholder='Search Products...'
      />
    </React.Fragment >
  );
};

const LoadingStateTable = () => {

  const [display, setDisplay] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setDisplay(true);
    }, 3000);
  }, []);

  const loadingStateTable =
    [
      { id: "10", name: "Tyrone", email: "tyrone@example.com", designation: "Senior Response Liaison", company: "Raynor, Rolfson and Daugherty", location: "Qatar" },
      { id: "09", name: "Cathy", email: "cathy@example.com", designation: "Customer Data Director", company: "Ebert, Schamberger and Johnston", location: "Mexico" },
      { id: "08", name: "Patsy", email: "patsy@example.com", designation: "Dynamic Assurance Director", company: "Streich Group", location: "Niue" },
      { id: "07", name: "Kerry", email: "kerry@example.com", designation: "Lead Applications Associate", company: "Feeney, Langworth and Tremblay", location: "Niger" },
      { id: "06", name: "Traci", email: "traci@example.com", designation: "Corporate Identity Director", company: "Koelpin - Goldner", location: "Vanuatu" },
      { id: "05", name: "Noel", email: "noel@example.com", designation: "Customer Data Director", company: "Howell - Rippin", location: "Germany" },
      { id: "04", name: "Robert", email: "robert@example.com", designation: "Product Accounts Technician", company: "Hoeger", location: "San Marino" },
      { id: "03", name: "Shannon", email: "shannon@example.com", designation: "Legacy Functionality Associate", company: "Zemlak Group", location: "South Georgia" },
      { id: "02", name: "Harold", email: "harold@example.com", designation: "Forward Creative Coordinator", company: "Metz Inc", location: "Iran" },
      { id: "01", name: "Jonathan", email: "jonathan@example.com", designation: "Senior Implementation Architect", company: "Hauck Inc", location: "Holy See" }
    ];

  const columns = useMemo(
    () => [
      {
        header: "Name",
        accessorKey: "name",
        enableColumnFilter: false,
      },
      {
        header: "Email",
        accessorKey: "email",
        enableColumnFilter: false,
      },
      {
        header: "Designation",
        accessorKey: "designation",
        enableColumnFilter: false,
      },
      {
        header: "Company",
        accessorKey: "company",
        enableColumnFilter: false,
      },
      {
        header: "Location",
        accessorKey: "location",
        enableColumnFilter: false,
      }
    ],
    []
  );

  return (
    <React.Fragment >
      {display ? <TableContainer
        columns={(columns || [])}
        data={(loadingStateTable || [])}
        customPageSize={5}
        SearchPlaceholder='Search Products...'
      /> : <div className="text-center"><Spinner animation="border" variant="primary" /></div>}
    </React.Fragment >
  );
};

const HiddenColumns = () => {
  const sortingTable =
    [
      { id: "10", name: "Tyrone", email: "tyrone@example.com", designation: "Senior Response Liaison", company: "Raynor, Rolfson and Daugherty", location: "Qatar" },
      { id: "09", name: "Cathy", email: "cathy@example.com", designation: "Customer Data Director", company: "Ebert, Schamberger and Johnston", location: "Mexico" },
      { id: "08", name: "Patsy", email: "patsy@example.com", designation: "Dynamic Assurance Director", company: "Streich Group", location: "Niue" },
      { id: "07", name: "Kerry", email: "kerry@example.com", designation: "Lead Applications Associate", company: "Feeney, Langworth and Tremblay", location: "Niger" },
      { id: "06", name: "Traci", email: "traci@example.com", designation: "Corporate Identity Director", company: "Koelpin - Goldner", location: "Vanuatu" },
      { id: "05", name: "Noel", email: "noel@example.com", designation: "Customer Data Director", company: "Howell - Rippin", location: "Germany" },
      { id: "04", name: "Robert", email: "robert@example.com", designation: "Product Accounts Technician", company: "Hoeger", location: "San Marino" },
      { id: "03", name: "Shannon", email: "shannon@example.com", designation: "Legacy Functionality Associate", company: "Zemlak Group", location: "South Georgia" },
      { id: "02", name: "Harold", email: "harold@example.com", designation: "Forward Creative Coordinator", company: "Metz Inc", location: "Iran" },
      { id: "01", name: "Jonathan", email: "jonathan@example.com", designation: "Senior Implementation Architect", company: "Hauck Inc", location: "Holy See" }
    ];

  const columns = useMemo(
    () => [
      {
        header: "Name",
        accessorKey: "name",
        enableColumnFilter: false,
      },
      {
        header: "Email",
        accessorKey: "email",
        enableColumnFilter: false,
      },
      {
        header: "Designation",
        accessorKey: "designation",
        enableColumnFilter: false,
      },
      {
        header: "Company",
        accessorKey: "company",
        enableColumnFilter: false,
      }
    ],
    []
  );

  return (
    <React.Fragment >
      <TableContainer
        columns={(columns || [])}
        data={(sortingTable || [])}
        customPageSize={5}
        SearchPlaceholder='Search Products...'
      />
    </React.Fragment >
  );
};

export { DefaultTable, PaginationTable, SearchTable, SortingTable, LoadingStateTable, HiddenColumns };