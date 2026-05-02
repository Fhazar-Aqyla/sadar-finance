import { recentTable } from '../../common/data';
import TableContainer from '../../Components/Common/TableContainer'
import React, { useMemo } from 'react'
import { Link } from 'react-router-dom';
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap'

const RecentArticleTable = () => {

    const columns = useMemo(
        () => [
          {
            header: "No",
            accessorKey: "id",
            enableColumnFilter: false,
            enableSorting: false,
          },
          {
            header: "Blog Title",
            accessorKey: "title",
            enableColumnFilter: false,
            cell: (cell) => {
                return (
                  <>
                  <img src={cell.row.original.image} alt="" className="me-2 rounded" height="40" />
                  <Link to="#!" className="text-body fw-medium">{cell.getValue()}</Link>
                  </>
                );
              },
          },
          {
            header: "Post Date",
            accessorKey: "date",
            enableColumnFilter: false,
          },
          {
            header: "Category",
            accessorKey: "category",
            enableColumnFilter: false,
            cell: (cell) => {
              return (
                <span className="badge bg-success-subtle text-success p-2">{cell.getValue()}</span>
              );
            },
          },
          {
            header: "Comment",
            accessorKey: "comments",
            enableColumnFilter: false,
          },
          {
            header: "Like",
            accessorKey: "likes",
            enableColumnFilter: false,
          },
          {
            header: "Shared",
            accessorKey: "shares",
            enableColumnFilter: false,
          },
          {
            header: "Viewers",
            accessorKey: "views",
            enableColumnFilter: false,
          }
        ],
        []
      );

    return (
        <React.Fragment>
            <div className="col-xl-8">
                <div className="card">
                    <div className="card-header align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">Recent Article</h4>
                        <div className="flex-shrink-0">
                            <UncontrolledDropdown className='card-header-dropdown'>
                                <DropdownToggle tag="a" href="#" className="text-reset dropdown-btn">
                                    <span className="fw-semibold text-uppercase fs-12">Sort by: </span><span className="text-muted">Popular <i className="mdi mdi-chevron-down ms-1"></i></span>
                                </DropdownToggle>
                                <DropdownMenu className="dropdown-menu-end">
                                    <li><DropdownItem>Popular</DropdownItem></li>
                                    <li><DropdownItem>Newest</DropdownItem></li>
                                    <li><DropdownItem>Oldest</DropdownItem></li>
                                </DropdownMenu>
                            </UncontrolledDropdown>
                        </div>
                    </div>
                    <div className="card-body">
                    <TableContainer
                      columns={columns}
                      data={recentTable || []}
                      customPageSize={5}
                      divClass="table-responsive table-card"
                      tableClass="table table-hover table-nowrap align-middle mb-0"
                      theadClass="table-light"
                      trClass="text-muted"
                    />
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}

export default RecentArticleTable