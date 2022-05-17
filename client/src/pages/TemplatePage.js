import React, { useState } from "react";
import { Container, Col, Row, Button, Dropdown, Form} from "react-bootstrap";
import ModalTemplate from "../components/ModalTemplate.js";
import ToggleSwitch from "../components/ToggleSwitch.js";

const defaultProps = {
    currentUser: {
        _id: "-1",
        name: "name",
    },
    showSwitch: false,
    allowChat: true,
    children: (<></>),
    socket: {
        emit: (val) => {
            console.log("socketEmit", val)
        }
    },
    additionalDropDownItems: null,
    errorMessage: "",
    setErrorMessage: (val) => {
        console.log("setErrorMessage", val);
    },
    loginHandler: (val) => {
        console.log("loginHandler", val);
    },
    updateUserName: (val) => {
        console.log("updateUserName", val);
    },
}

const TemplatePage = ({
    currentUser = defaultProps.currentUser,
    showSwitch = defaultProps.showSwitch,
    allowChat = defaultProps.allowChat,
    children = defaultProps.children,
    socket = defaultProps.socket,
    additionalDropDownItems = defaultProps.additionalDropDownItems,
    errorMessage = defaultProps.errorMessage,
    setErrorMessage = defaultProps.setErrorMessage,
    loginHandler = defaultProps.setLoginHandler,
    updateUserName = defaultProps.updateUserName,
}) => {
    const [showAccount, setShowAccount] = useState(true);
    const [newName, setNewDisplayName] = useState("");

    const handleDisplayNameInput = (event) => {
        setNewDisplayName(event.target.value);
    }

    const handleChangeSubmit = (event) => {
        event.preventDefault();
        const nameRegex = /^[A-z0-9_-]{3,15}$/;
        try{
            if(newName.match(nameRegex)===null){
                if(newName.length < 3 || newName.length > 15){
                    throw new Error("Usernames must be 3 to 15 characters long.");
                } else {
                    throw new Error("Usernames cannot have special characters.")
                }
            }
            if(newName === "server"){
                throw new Error("That user name is invalid.");
            }
            updateUserName(newName);
            setShowAccount(false);
        } catch(error){
            console.log("hadError")
            console.error(error);
            setErrorMessage(error.message);
        }
    }


    React.useEffect(()=>{
        setShowAccount(false);
    }, [])

    return(
        <Container fluid className="vh-100 text-center" style={{display: "flex", flexDirection: "column", overflow:"hidden", padding:0}} >
            <Row style={{justifyContent: "center"}} className="h-10 bg-dark text-light sticky-top">
                <Col/>
                <Col>
                    <h1 style={{cursor:"default"}}>Chatr</h1>
                </Col>
                <Col style={{display:"flex", alignItems: "center", justifyContent:"right", marginRight:"8px"}}>
                    <ToggleSwitch
                        show={showSwitch}
                        toggled={allowChat}
                        onToggle={()=>{
                            socket.emit("setAllowChat", !allowChat);
                        }}
                        name="allowChat"
                        style={{container:{width: "48px", height: "24px", marginLeft: "4px", marginRight:"16px"}}}
                    >
                    <span onClick={()=>{socket.emit("setAllowChat", !allowChat)}}>Allow Chat</span>
                    </ToggleSwitch>
                    <Button style={{marginRight:"16px"}}>
                        <i className="bi bi-bell"/>
                    </Button>
                    <Dropdown>
                        <Dropdown.Toggle id="dropdown-basic">{currentUser.name}</Dropdown.Toggle>
                        <Dropdown.Menu style={{minWidth: "100%"}}>
                            <Dropdown.Item onClick={()=>{
                                    setShowAccount(true);
                                    setErrorMessage("");
                                }}>
                                <i className="bi bi-person-circle" /> Account
                            </Dropdown.Item>
                            {additionalDropDownItems}
                            <Dropdown.Item style={{color:"red"}} onClick={()=>{
                                delete localStorage.currentUser;
                                loginHandler(false);
                            }}>
                                <i className="bi bi-power" /> Log Out
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
            </Row>
            {children}
            <ModalTemplate
                title="Account Settings"
                show={showAccount}
                hide={()=>{setShowAccount(false)}}
                handleSubmit={handleChangeSubmit.bind(this)}
            >
                <Form target="">
                    <Form.Group className="mb-3">
                        <Form.Label>Display Name</Form.Label>
                        <Form.Control placeholder={currentUser.name} onChange={(e)=>{handleDisplayNameInput(e)}}/>
                        <Form.Label style={{color:"#f44"}}>{errorMessage}</Form.Label>
                    </Form.Group>
                </Form>
            </ModalTemplate>
        </Container>
    )
}
export default TemplatePage;
