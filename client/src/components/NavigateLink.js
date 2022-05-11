import React from "react";
import { useNavigate } from "react-router-dom";

const defaultProps = {
    children: (<h1>
        goToIndex
    </h1>),
    to: "/",
}

const NavigateLink = ({
    children = defaultProps.children,
    to = defaultProps.to,
}) => {
    const navigate = useNavigate();

    return(
        <div onClick={()=>{navigate(to)}}>
            {children}
        </div>
    )
}

export default NavigateLink
