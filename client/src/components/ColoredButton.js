import React from "react";
import { Button } from 'react-bootstrap';

const defaultProps = {
    color: "defaultColor",
    children: (<></>),
    ref: ()=>{console.log("ref")}
}

const ColoredButton = React.forwardRef(({
    color = defaultProps.color,
    children = defaultProps.color,
    ...props
}, ref) =>{
    return(
        <>
        <style type="text/css">
        {`
            .btn-outline-`+color+`:hover{
                background-color: #`+color+`;
                color: #000;
            }
            .btn-outline-`+color+`.active{
                background-color: #`+color+`;
                color: #fff;
            }
            .btn-outline-`+color+`{
                border-color: #`+color+`;
                color: #`+color+`;
            }

        `}
        </style>
        <Button ref={ref} variant={"outline-"+color} {...props}>
            {children}
        </Button>
        </>
    )
})

export default ColoredButton;
