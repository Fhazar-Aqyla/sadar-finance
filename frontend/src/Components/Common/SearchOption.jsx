import React from "react";
import { Link } from "react-router-dom";
import { Input } from "reactstrap";

const SearchOption = () => {
  return (
    <form className="app-search sadar-app-search d-none d-md-block">
      <div className="position-relative">
        <Input
          type="text"
          className="form-control"
          placeholder="Cari transaksi, kategori, atau account..."
          id="search-options"
        />
        <span className="mdi mdi-magnify search-widget-icon"></span>
      </div>
      <div className="dropdown-menu dropdown-menu-lg" id="search-dropdown">
        <div className="p-3">
          <h6 className="text-muted text-uppercase fs-12 mb-3">Akses Cepat</h6>
          <Link to="/catat-keuangan" className="dropdown-item rounded-2">
            <i className="ri-add-circle-line align-middle fs-18 text-primary me-2"></i>
            Tambah Transaksi
          </Link>
          <Link to="/behavior-insight" className="dropdown-item rounded-2">
            <i className="ri-lightbulb-flash-line align-middle fs-18 text-info me-2"></i>
            Lihat Insight
          </Link>
          <Link to="/financial-score" className="dropdown-item rounded-2">
            <i className="ri-speed-up-line align-middle fs-18 text-warning me-2"></i>
            Financial Score
          </Link>
        </div>
      </div>
    </form>
  );
};

export default SearchOption;
