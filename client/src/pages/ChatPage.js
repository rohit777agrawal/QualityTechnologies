import React, { Component } from "react";
import { Container, Row, Col, InputGroup, FormControl, Button, Form, Dropdown, Modal } from 'react-bootstrap';
import ErrorBox from "../components/ErrorBox.js";
import Message from "../components/Message.js";
import URLButtonForm from "../components/URLButtonForm.js"
import 'bootstrap-icons/font/bootstrap-icons.css';

class ChatPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            draftMessage: "",
            showAccount: true,
            newDisplayName: "",
            messages: props.messages,
            url: "",
            showLink: false,
            showImage: false,
            error: ""
        }

        this.handleMessageInput = this.handleMessageInput.bind(this)

    }

    send(type){
        const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_+.~#?&//=]*)/;
        if(this.state.url.match(urlRegex)){
            this.props.messageHandler(this.state.url, type)
            this.setState({url: "", error: ""});
        } else {
            let testURL = "http://" + this.state.url;
            if(testURL.match(urlRegex)){
                this.props.messageHandler(testURL, type)
                this.setState({url: "", error: ""});
            } else {
                this.setState({error: "Invalid url"})
            }
        }

    }

    componentDidMount(){
        document.title = "Chatr Chat Window";
        this.setState({showAccount:false})
        this.props.initChat()
    }

    handleMessageInput(e){
        this.setState({draftMessage: e.target.value})
    }

    handleURLInput(e){
        this.setState({url: e.target.value});
    }

    toggleLink(){
        this.setState({showImage: false, showLink: !this.state.showLink });
    }

    toggleImage(){
        this.setState({showImage: !this.state.showImage, showLink: false });
    }

    renderActiveUsers(){
        return this.props.activeUsers.map((user, keyVal)=>{
            return <Button variant="outline-info" style={{cursor:"default"}} key={keyVal}>{user.displayName}</Button>
        })
    }

    renderMessages(){
        return this.props.messages.map((message, keyVal) => {
            return <Message wasSentByCurrentUser={true} key={keyVal} message={message}></Message>
        })
    }

    handleDisplayNameInput(event){
        this.setState({newDisplayName: event.target.value});
    }

    handleChangeSubmit(event){
        const displayNameRegex = /^[A-z0-9_-\s]{3,15}$/;
        event.preventDefault();
        try{
            if(this.state.newDisplayName.match(displayNameRegex)===null){
                if(this.state.newDisplayName.length < 3 || this.state.newDisplayName.length > 15){
                    throw new Error("Usernames must be 3 to 15 characters long.");
                } else {
                    throw new Error("Usernames cannot have special characters.")
                }
            }
            if(this.state.newDisplayName === "server"){
                throw new Error("That user name is invalid.");
            }
            this.props.updateLoginInfo({displayName: this.state.newDisplayName, _id: this.props.currentUser._id})
            .then(() => {
                this.setState({showAccount: false});
            })
            .catch((err) => {
                throw new Error(err);
            })
        } catch(error){
            this.props.setLoginError(error.message);
        }
    }

    render() {
        return (
            <Container fluid className="vh-100 text-center" style={{display: "flex", flexDirection: "column", overflow:"hidden", padding:0}} >
                <Row style={{justifyContent: "center"}} className="h-10 bg-dark text-light sticky-top">
                    <Col />
                    <Col>
                        <h1>Chatr</h1>
                    </Col>
                    <Col style={{display:"flex", alignItems: "center", justifyContent:"right", marginRight:"8px"}}>
                        <Button style={{marginRight:"16px"}}>
                            <i className="bi bi-bell"/>
                        </Button>
                        <Dropdown>
                            <Dropdown.Toggle id="dropdown-basic">{this.props.currentUser.displayName}</Dropdown.Toggle>
                            <Dropdown.Menu style={{minWidth: "100%"}}>
                                <Dropdown.Item onClick={()=>{
                                        this.setState({showAccount: true});
                                        this.props.setLoginError("");
                                    }}>
                                    <i className="bi bi-person-circle" /> Account
                                </Dropdown.Item>
                                <Dropdown.Item style={{color:"red"}} onClick={()=>{
                                    localStorage.setItem('currentUser', "");
                                    this.props.loginHandler(false);
                                }}>
                                    <i className="bi bi-power" /> Log Out
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                </Row>
                <Row style={{flex: "1 1 auto", width:"100%", overflow:"auto", margin:0}} className="align-items-bottom text-left">
                    <Col md="auto" style={{width: "10%", borderRight: "#aaa 2px solid", padding: "8px", display:"flex", flexDirection:"column"}}>
                        {this.renderActiveUsers()}
                    </Col>
                    <Col style = {{display:"flex", flexDirection: "column", width:"80%", padding:0}} className="align-items-bottom text-left">
                        {this.renderMessages()}
                    </Col>
                </Row>
                <Row className="h-20 fixed-bottom">
                    <Col/>
                    <Col>
                        <Form style = {{backgroundColor: "#fff"}}>
                            <InputGroup className="mb-3">
                            <FormControl
                                placeholder="type a message and press enter"
                                aria-label="message box"
                                aria-describedby="basic-addon2"
                                id="draftMessage"
                                value={this.state.draftMessage}
                                onChange={this.handleMessageInput}
                                />
                                <URLButtonForm
                                    url = {this.state.url}
                                    handleURLInput = {this.handleURLInput.bind(this)}
                                    send = {this.send.bind(this)}
                                    type = "link"
                                    toggle = {this.toggleLink.bind(this)}
                                    show = {this.state.showLink}>
                                    <i className="bi bi-link-45deg"></i> Link
                                </URLButtonForm>
                                <URLButtonForm
                                    url = {this.state.url}
                                    handleURLInput = {this.handleURLInput.bind(this)}
                                    send = {this.send.bind(this)}
                                    type = "image"
                                    toggle = {this.toggleImage.bind(this)}
                                    show = {this.state.showImage}>
                                    <i className="bi bi-card-image"></i> Image
                                </URLButtonForm>
                                <Button variant="outline-secondary" type="submit" disabled={this.state.draftMessage.replaceAll(/\s/g)===""} id="button-addon2" onClick={(e)=>{
                                    e.preventDefault();
                                    this.props.messageHandler(this.state.draftMessage, "text");
                                    this.setState({draftMessage: ""});
                                }}>
                                    Send
                                </Button>
                            </InputGroup>
                        </Form>
                    </Col>
                    <Col/>
                </Row>
                <Row >
                    <Col className="fixed-bottom">
                        <ErrorBox>{this.state.error}</ErrorBox>
                    </Col>
                </Row>
                <Modal show={this.state.showAccount} onHide={()=>{this.setState({showAccount: false})}}>
                    <Modal.Header closeButton>
                        <Modal.Title style={{textAlign: "center"}}>Account Settings</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form target="">
                            <Form.Group className="mb-3">
                                <Form.Label>Display Name</Form.Label>
                                <Form.Control placeholder={this.props.currentUser.displayName} onChange={(e)=>{this.handleDisplayNameInput(e)}}/>
                                <Form.Label style={{color:"#f44"}}>{this.props.loginError}</Form.Label>
                            </Form.Group>
                            <div style={{display:"flex", justifyContent:"space-evenly"}}>
                            <Button variant="secondary" onClick={()=>{this.setState({showAccount: false})}}>
                            Close
                            </Button>
                            <Button variant="primary" type="submit" onClick={(e)=>{
                                this.handleChangeSubmit(e);
                            }}>
                                Save Changes
                            </Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>
            </Container>
        );
    }
}

export default ChatPage;
