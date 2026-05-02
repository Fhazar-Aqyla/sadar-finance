import React, { useEffect } from "react"
import { Spinner } from "reactstrap";

const Spinners = ({ setLoading }) => {

    useEffect(() => {
        setTimeout(() => {
            setLoading(false)
        }, 1000)
    }, [setLoading]);

    return (
        <React.Fragment>
            <Spinner className='position-absolute top-50 start-50' animation='border' color="primary" />
        </React.Fragment>
    )
}

export default Spinners;