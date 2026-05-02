import { comments } from '../../common/data'
import React from 'react'
import SimpleBar from 'simplebar-react'

const RecentComment = () => {
    return (
        <React.Fragment>
            <div className="col-xl-3">
                <div className="card">
                    <div className="card-header align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">Recent Comment</h4>
                        <div className="flex-shrink-0">
                            <button type="button" className="btn btn-soft-primary btn-sm">
                                View All
                            </button>
                        </div>
                    </div>
                    <div className="card-body">
                        <SimpleBar data-simplebar className="mx-n3 px-3" style={{ height: "375px" }}>
                            <div className="vstack gap-3">
                               {comments.map((item, idx) => ( 
                                <div className="d-flex gap-3" key={idx}>
                                    <img src={item.avatar} alt="" className="avatar-sm rounded flex-shrink-0" />
                                    <div className="flex-shrink-1">
                                        <h6 className="mb-2">{item.name} <span className="text-muted">Has commented</span></h6>
                                        <p className="text-muted mb-0">{item.comment}</p>
                                    </div>
                                </div>
                            ))}
                            </div>
                        </SimpleBar>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}

export default RecentComment