import React, { useState } from "react";
import { Container, Col, Row, Button, Dropdown, Modal, Form} from "react-bootstrap";
import ToggleSwitch from "../components/ToggleSwitch.js";

const defaultProps = {
    parent: {
        setState : (val) => {
            console.log("setState", val)
        },
    },
    currentUser: {
        _id: "-1",
        displayName: "displayName",
    },
    showSwitch: false,
    allowChat: true,
    children: (<></>),
    socket: {
        emit: (val) => {
            console.log("socketEmit", val)
        }
    },
    setLoginError: (val) => {
        console.log("setLoginError", val);
    },
    loginHandler: (val) => {
        console.log("loginHandler", val);
    },
    updateLoginInfo: (val) => {
        console.log("updateLoginInfo", val);
    },
}

const TemplatePage = ({
    parent = defaultProps.parent,
    currentUser = defaultProps.currentUser,
    showSwitch = defaultProps.showSwitch,
    allowChat = defaultProps.allowChat,
    children = defaultProps.children,
    socket = defaultProps.socket,
    setLoginError = defaultProps.setLoginError,
    loginHandler = defaultProps.setLoginHandler,
    updateLoginInfo = defaultProps.updateLoginInfo,
}) => {
    const [showAccount, setShowAccount] = useState(true);
    const [newDisplayName, setNewDisplayName] = useState("");

    const handleDisplayNameInput = (event) => {
        setNewDisplayName(event.target.value);
    }

    const handleChangeSubmit = (event) => {
        const displayNameRegex = /^[A-z0-9_-\s]{3,15}$/;
        event.preventDefault();
        try{
            if(newDisplayName.match(displayNameRegex)===null){
                if(newDisplayName.length < 3 || newDisplayName.length > 15){
                    throw new Error("Usernames must be 3 to 15 characters long.");
                } else {
                    throw new Error("Usernames cannot have special characters.")
                }
            }
            if(newDisplayName === "server"){
                throw new Error("That user name is invalid.");
            }
            updateLoginInfo({displayName: newDisplayName, _id: currentUser._id})
            .then(() => {
                setShowAccount(false);
            })
            .catch((err) => {
                throw new Error(err);
            })
        } catch(error){
            parent.props.setLoginError(error.message);
        }
    }


    React.useEffect(()=>{
        setShowAccount(false);
    }, [])

    return(
        <Container fluid className="vh-100 text-center" style={{display: "flex", flexDirection: "column", overflow:"hidden", padding:0}} >
            <Row style={{justifyContent: "center"}} className="h-10 bg-dark text-light sticky-top">
                <Col />
                <Col>
                    <h1>Chatr</h1>
                </Col>
                <Col style={{display:"flex", alignItems: "center", justifyContent:"right", marginRight:"8px"}}>
                    <ToggleSwitch
                        show={showSwitch}
                        toggled={allowChat}
                        onToggle={()=>{
                            socket.emit("toggleAllowChatToServer");
                        }}
                        name="allowChat"
                        style={{container:{width: "48px", height: "24px", marginLeft: "4px", marginRight:"16px"}}}
                    >
                    Allow Chat
                    </ToggleSwitch>
                    <Button style={{marginRight:"16px"}}>
                        <i className="bi bi-bell"/>
                    </Button>
                    <Dropdown>
                        <Dropdown.Toggle id="dropdown-basic">{currentUser.displayName}</Dropdown.Toggle>
                        <Dropdown.Menu style={{minWidth: "100%"}}>
                            <Dropdown.Item onClick={()=>{
                                    setShowAccount(true);
                                    setLoginError("");
                                }}>
                                <i className="bi bi-person-circle" /> Account
                            </Dropdown.Item>
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
            <Modal show={showAccount} onHide={()=>{setShowAccount(false)}}>
                <Modal.Header closeButton>
                    <Modal.Title style={{textAlign: "center"}}>Account Settings</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form target="">
                        <Form.Group className="mb-3">
                            <Form.Label>Display Name</Form.Label>
                            <Form.Control placeholder={currentUser.displayName} onChange={(e)=>{handleDisplayNameInput(e)}}/>
                            <Form.Label style={{color:"#f44"}}>{parent.loginError}</Form.Label>
                        </Form.Group>
                        <div style={{display:"flex", justifyContent:"space-evenly"}}>
                        <Button variant="secondary" onClick={()=>{setShowAccount(false)}}>
                        Close
                        </Button>
                        <Button variant="primary" type="submit" onClick={(e)=>{
                            handleChangeSubmit(e);
                        }}>
                            Save Changes
                        </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    )
}
export default TemplatePage;
