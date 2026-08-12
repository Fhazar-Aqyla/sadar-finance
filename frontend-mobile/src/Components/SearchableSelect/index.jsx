import React, { useState, useRef, useEffect, useId } from "react";
import { INSTITUTION_GROUPS, findInstitutionByName } from "../../constants/bankData";

const SearchableSelect = ({
  value,
  onChange,
  placeholder = "Pilih Bank atau E-Wallet...",
  invalid = false,
  error = "",
  id,
  name = "bank",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const dropdownMenuRef = useRef(null);
  const generatedId = useId();
  const selectId = id || generatedId;

  // Resolve current selection object
  const selectedInstitution = findInstitutionByName(value) || (value ? { name: value, icon: "ri-wallet-3-line" } : null);

  // Filter options based on query
  const query = searchQuery.trim().toLowerCase();
  
  const filteredGroups = INSTITUTION_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.shortName.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
    ),
  })).filter((group) => group.items.length > 0);

  // Flattened array for keyboard navigation
  const flatFilteredItems = filteredGroups.flatMap((group) => group.items);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto focus search input when dropdown opens
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
      setHighlightedIndex(0);
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleSelect = (item) => {
    onChange(item);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "Escape" || e.key === "Tab") {
      setIsOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < flatFilteredItems.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : flatFilteredItems.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatFilteredItems[highlightedIndex]) {
        handleSelect(flatFilteredItems[highlightedIndex]);
      }
    }
  };

  return (
    <div
      className={`sadar-searchable-select-container ${isOpen ? "open" : ""}`}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        id={selectId}
        name={name}
        className={`sadar-searchable-select-trigger form-control ${
          invalid ? "is-invalid" : ""
        }`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="sadar-select-value">
          {selectedInstitution ? (
            <span className="d-flex align-items-center gap-2">
              <span className="sadar-institution-icon" aria-hidden="true">
                <i className={selectedInstitution.icon}></i>
              </span>
              <span className="sadar-institution-name fw-medium">
                {selectedInstitution.name}
              </span>
            </span>
          ) : (
            <span className="text-muted">{placeholder}</span>
          )}
        </span>
        <i
          className={`ri-arrow-down-s-line sadar-select-chevron ${
            isOpen ? "rotated" : ""
          }`}
        ></i>
      </button>

      {isOpen && (
        <div
          className="sadar-searchable-select-menu"
          ref={dropdownMenuRef}
          role="listbox"
        >
          <div className="sadar-select-search-header">
            <i className="ri-search-line search-icon"></i>
            <input
              ref={searchInputRef}
              type="text"
              className="sadar-select-search-input"
              placeholder="Cari bank atau e-wallet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {searchQuery && (
              <button
                type="button"
                className="sadar-select-clear-search"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery("");
                  if (searchInputRef.current) searchInputRef.current.focus();
                }}
              >
                <i className="ri-close-line"></i>
              </button>
            )}
          </div>

          <div className="sadar-select-options-list">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <div key={group.type} className="sadar-select-group">
                  <div className="sadar-select-group-header">
                    <span className="sadar-select-group-icon" aria-hidden="true">
                      <i className={group.icon}></i>
                    </span>
                    <span>{group.label}</span>
                  </div>
                  {group.items.map((item) => {
                    const globalIndex = flatFilteredItems.findIndex(
                      (flatItem) => flatItem.id === item.id
                    );
                    const isSelected =
                      selectedInstitution?.id === item.id ||
                      selectedInstitution?.name === item.name;
                    const isHighlighted = globalIndex === highlightedIndex;

                    return (
                      <div
                        key={item.id}
                        className={`sadar-select-option ${
                          isSelected ? "selected" : ""
                        } ${isHighlighted ? "highlighted" : ""}`}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setHighlightedIndex(globalIndex)}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <span className="sadar-select-option-icon" aria-hidden="true">
                          <i className={item.icon}></i>
                        </span>
                        <span className="option-name">{item.name}</span>
                        {isSelected && (
                          <i className="ri-check-line option-check ms-auto"></i>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              <div className="sadar-select-empty-state">
                <i className="ri-search-2-line fs-20 text-muted mb-1"></i>
                <p className="mb-0 text-muted fs-13">
                  Bank atau e-wallet tidak ditemukan
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {invalid && error && (
        <div className="invalid-feedback d-block mt-1 fs-12">{error}</div>
      )}
    </div>
  );
};

export default SearchableSelect;
