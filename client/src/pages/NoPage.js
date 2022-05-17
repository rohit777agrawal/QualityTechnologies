import React from "react";
import { useNavigate } from "react-router-dom";

const defaultProps = {
    validateUser: () => {
        return new Promise((res, _) => {
            res();
        })
    }
}

const NoPage = ({validateUser = defaultProps.validateUser}) => {
    const hexadecimal = /^[0-9a-fA-F]+$/;
    const navigate = useNavigate();
    React.useEffect(async ()=>{
        console.log(hexadecimal.test(window.location.pathname.split("/")[1]), window.location.pathname.split("/")[1])
        if(hexadecimal.test(window.location.pathname.split("/")[1]) || window.location.pathname.split("/")[1]){
            await validateUser(window.location.pathname.split("/")[1])
                .then((res, rej)=>{
                    console.log(res, rej);
                    if(rej){
                        console.log("rej", rej)
                        navigate("/error404");
                    }
                    navigate("/chat");
                })
                .catch((err)=>{
                    console.log("err", err);
                    navigate("/error404");
                })
        } else {
            console.log("else")
            navigate("/error404")
        }
    })
    return(
        <>
        </>
    )
}

export default NoPage;
