import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Modal, ModalBody, ModalHeader, Input, Progress, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import FeatherIcon from 'feather-icons-react';


//SimpleBar
import SimpleBar from "simplebar-react";

//import images
import image2 from "../../assets/images/users/avatar-2.jpg";
import image4 from "../../assets/images/users/avatar-4.jpg";
import image3 from "../../assets/images/users/avatar-3.jpg";
import image5 from "../../assets/images/users/avatar-5.jpg";

const EmailSidebar = () => {
  const [modal, setModal] = useState(false);

  const toggle = () => {
    if (modal) {
      setModal(false);
    } else {
      setModal(true);
    }
  };
  return (
    <React.Fragment>
      <div className="email-menu-sidebar border">
        <div className="p-4 d-flex flex-column h-100">
          <div className="pb-4 border-bottom border-bottom-dashed">
            <button
              type="button"
              className="btn btn-danger w-100"
              data-bs-toggle="modal"
              data-bs-target="#composemodal"
              onClick={() => {
                setModal(true);
              }}
            >
              <FeatherIcon icon="plus-circle" className="icon-xs me-1 icon-dual-light" />
              Compose
            </button>
          </div>

          <SimpleBar
            className="mx-n4 px-4 email-menu-sidebar-scroll"
            data-simplebar
          >
            <div className="mail-list mt-3">
              <Link to="#" className="active"><i className="ri-mail-fill me-3 align-middle fw-medium"></i> <span className="mail-list-link">All</span> <span className="badge bg-success-subtle text-success ms-auto  ">5</span></Link>
              <Link to="#"><i className="ri-inbox-archive-fill me-3 align-middle fw-medium"></i> <span className="mail-list-link">Inbox</span> <span className="badge bg-success-subtle text-success ms-auto  ">5</span></Link>
              <Link to="#"><i className="ri-send-plane-2-fill me-3 align-middle fw-medium"></i><span className="mail-list-link">Sent</span></Link>
              <Link to="#"><i className="ri-edit-2-fill me-3 align-middle fw-medium"></i><span className="mail-list-link">Draft</span></Link>
              <Link to="#"><i className="ri-error-warning-fill me-3 align-middle fw-medium"></i><span className="mail-list-link">Spam</span></Link>
              <Link to="#"><i className="ri-delete-bin-5-fill me-3 align-middle fw-medium"></i><span className="mail-list-link">Trash</span></Link>
              <Link to="#"><i className="ri-star-fill me-3 align-middle fw-medium"></i><span className="mail-list-link">Starred</span></Link>
              <Link to="#"><i className="ri-price-tag-3-fill me-3 align-middle fw-medium"></i><span className="mail-list-link">Important</span></Link>
            </div>

            <div>
              <h5 className="fs-12 text-uppercase text-muted mt-4">Labels</h5>

              <div className="mail-list mt-1">
              <Link to="#"><span className="ri-checkbox-blank-circle-line me-2 text-info"></span><span className="mail-list-link" data-type="label">Support</span> <span className="badge bg-success-subtle text-success ms-auto">3</span></Link>
              <Link to="#"><span className="ri-checkbox-blank-circle-line me-2 text-warning"></span><span className="mail-list-link" data-type="label">Freelance</span></Link>
              <Link to="#"><span className="ri-checkbox-blank-circle-line me-2 text-primary"></span><span className="mail-list-link" data-type="label">Social</span></Link>
              <Link to="#"><span className="ri-checkbox-blank-circle-line me-2 text-danger"></span><span className="mail-list-link" data-type="label">Friends</span><span className="badge bg-success-subtle text-success ms-auto">2</span></Link>
              <Link to="#"><span className="ri-checkbox-blank-circle-line me-2 text-success"></span><span className="mail-list-link" data-type="label">Family</span></Link>
              </div>
            </div>

            <div className="border-top border-top-dashed pt-3 mt-3">
              <Link
                to="#"
                className="btn btn-icon btn-sm btn-soft-info rounded-pill float-end"
              >
                <i className="bx bx-plus fs-16"></i>
              </Link>
              <h5 className="fs-12 text-uppercase text-muted mb-3">Chat</h5>

              <div className="mt-2 vstack email-chat-list mx-n4">
                <Link to="#" className="d-flex align-items-center active">
                  <div className="flex-shrink-0 me-2 avatar-xxs chatlist-user-image">
                    <img
                      className="img-fluid rounded-circle"
                      src={image2}
                      alt=""
                    />
                  </div>

                  <div className="flex-grow-1 chat-user-box overflow-hidden">
                    <h5 className="fs-13 text-truncate mb-0">Scott Median</h5>
                    <small className="text-muted text-truncate mb-0">
                      Hello ! are you there?
                    </small>
                  </div>
                </Link>

                <Link to="#" className="d-flex align-items-center">
                  <div className="flex-shrink-0 me-2 avatar-xs">
                    <img
                      className="img-fluid rounded-circle"
                      src={image4}
                      alt=""
                    />
                  </div>

                  <div className="flex-grow-1 chat-user-box overflow-hidden">
                    <h5 className="fs-13 text-truncate mb-0">Julian Rosa</h5>
                    <small className="text-muted text-truncate mb-0">
                      What about our next..
                    </small>
                  </div>
                </Link>

                <Link to="#" className="d-flex align-items-center">
                  <div className="flex-shrink-0 me-2 avatar-xs">
                    <img
                      className="img-fluid rounded-circle"
                      src={image3}
                      alt=""
                    />
                  </div>

                  <div className="flex-grow-1 chat-user-box overflow-hidden">
                    <h5 className="fs-13 text-truncate mb-0">David Medina</h5>
                    <small className="text-muted text-truncate mb-0">
                      Yeah everything is fine
                    </small>
                  </div>
                </Link>

                <Link to="#" className="d-flex align-items-center">
                  <div className="flex-shrink-0 me-2 avatar-xs">
                    <img
                      className="img-fluid rounded-circle"
                      src={image5}
                      alt=""
                    />
                  </div>

                  <div className="flex-grow-1 chat-user-box overflow-hidden">
                    <h5 className="fs-13 text-truncate mb-0">Jay Baker</h5>
                    <small className="text-muted text-truncate mb-0">
                      Wow that's great
                    </small>
                  </div>
                </Link>
              </div>
            </div>
          </SimpleBar>

          <div className="mt-auto">
            <h5 className="fs-13">1.75 GB of 10 GB used</h5>
            <Progress color="success" className="progress-sm" value={25} />
          </div>
        </div>
      </div>

      <Modal id="composemodal" className="modal-lg" isOpen={modal} toggle={toggle} centered>
        <ModalHeader className="p-3 bg-light" toggle={toggle}>
          New Message
        </ModalHeader>
        <ModalBody>
          <div>
            <div className="mb-3 position-relative">
              <Input
                type="text"
                className="form-control email-compose-input"
                defaultValue="support@themesbrand.com"
              />
              <div className="position-absolute top-0 end-0">
                <div className="d-flex">
                  <button
                    className="btn btn-link text-reset fw-semibold px-2"
                    type="button"
                  >
                    Cc
                  </button>
                  <button
                    className="btn btn-link text-reset fw-semibold px-2"
                    type="button"
                  >
                    Bcc
                  </button>
                </div>
              </div>
            </div>
            <div className="collapse" id="CcRecipientsCollapse">
              <div className="mb-3">
                <label>Cc:</label>
                <Input
                  type="text"
                  className="form-control"
                  placeholder="Cc recipients"
                />
              </div>
            </div>
            <div className="collapse" id="BccRecipientsCollapse">
              <div className="mb-3">
                <label>Bcc:</label>
                <Input
                  type="text"
                  className="form-control"
                  placeholder="Bcc recipients"
                />
              </div>
            </div>

            <div className="mb-3">
              <Input type="text" className="form-control" placeholder="Subject" />
            </div>
            <div className="ck-editor-reverse">
              <CKEditor
                editor={ClassicEditor}
                onReady={(editor) => {
                  // You can store the "editor" and use when it is needed.

                }}
                onChange={(event, editor) => {
                  editor.getData();
                }}
              />
            </div>
          </div>
        </ModalBody>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-ghost-danger"
            onClick={() => {
              setModal(false);
            }}
          >
            Discard
          </button>

          <UncontrolledDropdown className="btn-group">
            <button
              type="button"
              className="btn btn-success"
              onClick={() => {
                setModal(false);
              }}
            >
              Send
            </button>
            <DropdownToggle
              tag="button"
              type="button"
              className="btn btn-success"
              split
            >
              <span className="visually-hidden">Toggle Dropdown</span>
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end">
              <li>
                <DropdownItem href="#">
                  <i className="ri-timer-line text-muted me-1 align-bottom"></i>{" "}
                  Schedule Send
                </DropdownItem>
              </li>
            </DropdownMenu>
          </UncontrolledDropdown>
        </div>
      </Modal>
    </React.Fragment>
  );
};

export default EmailSidebar;
