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
    React.useEffect(()=>{
        if(hexadecimal.test(window.location.pathname.split("/")[1])){
            validateUser(window.location.pathname.split("/")[1])
                .then((res, rej)=>{
                    console.log(res, rej);
                    if(res){
                        navigate("/chat");
                    }
                    if(rej){
                        navigate("/error404");
                    }
                })
                .catch(()=>{
                    navigate("/error404");
                })
        } else {
            navigate("/error404")
        }
    })
    return(
        <>
        </>
    )
}

export default NoPage;
