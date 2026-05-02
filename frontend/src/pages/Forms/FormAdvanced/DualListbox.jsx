import React, { useState } from 'react'
import DualListBox from "react-dual-listbox";
import "react-dual-listbox/lib/react-dual-listbox.css";
import { Col, Row } from 'reactstrap';



const options = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "blueberry", label: "Blueberry" },
  { value: "cherry", label: "Cherry" },
  { value: "coconut", label: "Coconut" },
  { value: "grapefruit", label: "Grapefruit" },
  { value: "kiwi", label: "Kiwi" },
  { value: "lemon", label: "Lemon" },
  { value: "lime", label: "Lime" },
  { value: "mango", label: "Mango" },
  { value: "orange", label: "Orange" },
  { value: "papaya", label: "Papaya" },
];


const Optgroup = [
  {
    label: "Cars",
    options: [
      { value: "chevrolet", label: "Chevrolet" },
      { value: "fiat", label: "Fiat" },
      { value: "ford", label: "Ford" },
      { value: "honda", label: "Honda" },
      { value: "hyundai", label: "Hyundai" },
      { value: "kia", label: "Kia" },
      { value: "mahindra", label: "Mahindra" },
      { value: "maruti", label: "Maruti" },
      { value: "mistubishi", label: "Mistubishi" },
      { value: "mg", label: "MG" },
      { value: "nissan", label: "Nissan" },
      { value: "renault", label: "Renault" },
      { value: "skoda", label: "Skoda" },
      { value: "tata", label: "Tata" },
      { value: "toyota", label: "Toyota" },
      { value: "volkswagen", label: "Volkswagen" },
    ],
  },
];

const OptgroupFilter = [
  {
    label: "Skoda",
    options: [
      { value: "kushaq", label: "Kushaq" },
      { value: "superb", label: "Superb" },
      { value: "octavia", label: "Octavia" },
      { value: "rapid", label: "Rapid" },
    ],
  },
  {
    label: "Volkswagen",
    options: [
      { value: "polo", label: "Polo" },
      { value: "taigun", label: "Taigun" },
      { value: "vento", label: "Vento" },
    ],
  },
];
const DualListbox = () => {
  const [selected, setSelected] = useState(["apple", "blueberry", "cherry"]);
  const [selectedOptGroup, setSelectedOptGroup] = useState([
    "hyundai",
    "skoda",
    "tata",
    "toyota",
  ]);
  const [selectedFilter, setSelectedFilter] = useState(["luna"]);
  return (
    <React.Fragment>
      <Row>
        <Col lg={6}>
          <div>
            <h5 className="fs-14 mb-1">Basic Example</h5>
            <p className="text-muted">Example of Dual Listbox Basic </p>
            <DualListBox
              options={options}
              selected={selected}
              onChange={(e) => setSelected(e)}
              icons={{
                moveLeft: <span className="mdi mdi-chevron-left" key="key" />,
                moveAllLeft: [
                  <span className="mdi mdi-chevron-double-left" key="key" />,
                ],
                moveRight: <span className="mdi mdi-chevron-right" key="key" />,
                moveAllRight: [
                  <span className="mdi mdi-chevron-double-right" key="key" />,
                ],
                moveDown: <span className="mdi mdi-chevron-down" key="key" />,
                moveUp: <span className="mdi mdi-chevron-up" key="key" />,
                moveTop: (
                  <span className="mdi mdi-chevron-double-up" key="key" />
                ),
                moveBottom: (
                  <span className="mdi mdi-chevron-double-down" key="key" />
                ),
              }}
            />
          </div>
        </Col>
        <Col lg={6}>
          <div className="mt-4 mt-lg-0">
            <h5 className="fs-14 mb-1">Headers</h5>
            <p className="text-muted">Example of Dual Listbox Headers </p>
            <DualListBox
              canFilter
              filterCallback={(Optgroup, filterInput) => {
                if (filterInput === "") {
                  return true;
                }

                return new RegExp(filterInput, "i").test(Optgroup.label);
              }}
              filterPlaceholder="Search..."
              b
              options={Optgroup}
              selected={selectedOptGroup}
              onChange={(e) => setSelectedOptGroup(e)}
              icons={{
                moveLeft: <span className="mdi mdi-chevron-left" key="key" />,
                moveAllLeft: [
                  <span className="mdi mdi-chevron-double-left" key="key" />,
                ],
                moveRight: <span className="mdi mdi-chevron-right" key="key" />,
                moveAllRight: [
                  <span className="mdi mdi-chevron-double-right" key="key" />,
                ],
                moveDown: <span className="mdi mdi-chevron-down" key="key" />,
                moveUp: <span className="mdi mdi-chevron-up" key="key" />,
                moveTop: (
                  <span className="mdi mdi-chevron-double-up" key="key" />
                ),
                moveBottom: (
                  <span className="mdi mdi-chevron-double-down" key="key" />
                ),
              }}
            />
          </div>
        </Col>
      </Row>
      <Row>
        <Col lg={6}>
          <div className="mt-4">
            <h5 className="fs-14 mb-1">Option Groups</h5>
            <p className="text-muted">Example of Dual Listbox Option Groups</p>
            <DualListBox
              canFilter
              filterCallback={(Optgroup, filterInput) => {
                if (filterInput === "") {
                  return true;
                }

                return new RegExp(filterInput, "i").test(Optgroup.label);
              }}
              filterPlaceholder="Search..."
              options={OptgroupFilter}
              selected={selectedFilter}
              onChange={(e) => setSelectedFilter(e)}
              icons={{
                moveLeft: <span className="mdi mdi-chevron-left" key="key" />,
                moveAllLeft: [
                  <span className="mdi mdi-chevron-double-left" key="key" />,
                ],
                moveRight: <span className="mdi mdi-chevron-right" key="key" />,
                moveAllRight: [
                  <span className="mdi mdi-chevron-double-right" key="key" />,
                ],
                moveDown: <span className="mdi mdi-chevron-down" key="key" />,
                moveUp: <span className="mdi mdi-chevron-up" key="key" />,
                moveTop: (
                  <span className="mdi mdi-chevron-double-up" key="key" />
                ),
                moveBottom: (
                  <span className="mdi mdi-chevron-double-down" key="key" />
                ),
              }}
            />
          </div>
        </Col>
      </Row>
    </React.Fragment>
  )
}

export default DualListbox