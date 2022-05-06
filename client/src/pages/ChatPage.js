import React, { Component } from "react";
import { Container, Row, Col, InputGroup, FormControl, Button, Form, Dropdown, Modal, OverlayTrigger, Popover} from 'react-bootstrap';
import Picker from "emoji-picker-react";
import ErrorBox from "../components/ErrorBox.js";
import Message from "../components/Message.js";
import ToggleSwitch from "../components/ToggleSwitch.js";
import URLButtonForm from "../components/URLButtonForm.js";
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
            error: "",
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
        this.messageForm.addEventListener("submit", (event)=>{
            event.preventDefault();
            if(this.state.draftMessage){
                this.props.messageHandler(this.state.draftMessage, "text");
                this.setState({draftMessage: ""});
            }
        })
        this.textArea.addEventListener("keypress", (event)=>{
            if(event.charCode === 13 && event.shiftKey === false){
                event.target.form.dispatchEvent(new Event("submit", {bubbles: true, cancelable: true}));
                event.preventDefault(); // Prevents the addition of a new line in the text field (not needed in a lot of cases)
            }
        })
    }

    handleMessageInput(e){
        this.setState({draftMessage: e.target.value})
    }

    handleURLInput(e){
        this.setState({url: e.target.value});
    }

    toggleEmoji(){
        this.setState({
            showEmoji: !this.state.showEmoji,
            showLink: false,
            showImage: false,
        });
    }

    toggleLink(){
        this.setState({
            showEmoji: false,
            showLink: !this.state.showLink,
            showImage: false,
        });
    }

    toggleImage(){
        this.setState({
            showEmoji: false,
            showLink: false,
            showImage: !this.state.showImage,
        });
    }

    renderActiveUsers(){
        return this.props.activeUsers.map((user, keyVal)=>{
            return <Button variant="outline-info" style={{cursor:"default", margin:"2pt 0"}} key={keyVal}>{user.displayName}</Button>
        })
    }

    renderMessages(){
        return this.props.messages.map((message, keyVal) => {
            return <Message socket={this.props.socket} currentUser={this.props.currentUser.displayName} key={keyVal} message={message}></Message>
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
                        <ToggleSwitch
                            show={this.props.currentUser.isTeacher}
                            toggled={this.props.allowChat}
                            onToggle={()=>{
                                this.props.socket.emit("toggleAllowChatToServer");
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
                    <Col style = {{display:"flex", flexDirection: "column", width:"80%", padding: "0 4px 48pt 4px"}} className="align-items-bottom text-left">
                        {this.renderMessages()}
                    </Col>
                </Row>
                <Row className="h-20 fixed-bottom">
                    <Col/>
                    <Col>
                        <Form ref={(ref)=>{this.messageForm = ref;}} style = {{backgroundColor: "#fff"}}>
                            <InputGroup className="mb-3">
                            <FormControl
                                disabled={!(this.props.allowChat || this.props.currentUser.isTeacher)}
                                ref={(ref)=>{this.textArea = ref;}}
                                as="textarea"
                                placeholder="type a message and press enter"
                                aria-label="message box"
                                aria-describedby="basic-addon2"
                                id="draftMessage"
                                value={this.state.draftMessage}
                                onChange={this.handleMessageInput}
                                />
                                <OverlayTrigger trigger="click" show={this.state.showEmoji} onToggle={()=>{this.toggleEmoji()}} placement="top" overlay = {
                                    <Popover id="popover-Emoji">
                                        <Popover.Header as="h3">Pick an Emoji</Popover.Header>
                                        <Popover.Body style={{padding:"2px"}}>
                                            <Picker pickerStyle={{
                                                border: 0,
                                                boxShadow: 0
                                            }}  native={true} onEmojiClick={(event, emojiObject) => {
                                                this.setState({draftMessage: this.state.draftMessage+emojiObject.emoji});
                                            }}/>
                                        </Popover.Body>
                                    </Popover>
                                }>
                                    <Button variant="outline-secondary" id="button-addon2">
                                        <i className="bi bi-emoji-smile"/>
                                    </Button>
                                </OverlayTrigger>
                                <URLButtonForm
                                    url = {this.state.url}
                                    handleURLInput = {this.handleURLInput.bind(this)}
                                    send = {this.send.bind(this)}
                                    type = "link"
                                    toggle = {this.toggleLink.bind(this)}
                                    show = {this.state.showLink}>
                                    <i className="bi bi-link-45deg"/>
                                </URLButtonForm>
                                <URLButtonForm
                                    url = {this.state.url}
                                    handleURLInput = {this.handleURLInput.bind(this)}
                                    send = {this.send.bind(this)}
                                    type = "image"
                                    toggle = {this.toggleImage.bind(this)}
                                    show = {this.state.showImage}>
                                    <i className="bi bi-card-image"/>
                                </URLButtonForm>
                                <Button variant="outline-secondary" type="submit" disabled={this.state.draftMessage.replaceAll(/\s/g)===""} id="button-addon2">
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
