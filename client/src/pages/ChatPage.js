import React, { Component } from "react";
import { Row, Col, InputGroup, FormControl, Button, Form, OverlayTrigger, Popover, Dropdown, Accordion} from 'react-bootstrap';
import TemplatePage from "./TemplatePage.js";
import Picker from "emoji-picker-react";
import Message from "../components/Message.js";
import URLButtonForm from "../components/URLButtonForm.js";
import ErrorBox from "../components/ErrorBox.js";
import NavigateLink from "../components/NavigateLink";
import 'bootstrap-icons/font/bootstrap-icons.css';

class ChatPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            draftMessage: "",
            messages: props.messages,
            url: "",
            showEmoji: false,
            showLink: false,
            showImage: false,
            error: "",
        }
        this.handleMessageInput = this.handleMessageInput.bind(this)
    }

    send(type){ // TODO: Update to messageobj
        console.log("currentGroup", this.props.currentGroup)
        const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_+.~#?&//=]*)/;
        if(this.state.url.match(urlRegex)){
            this.props.messageHandler(this.state.url, this.props.currentGroup, type)
            this.setState({url: "", error: ""});
        } else {
            let testURL = "http://" + this.state.url;
            if(testURL.match(urlRegex)){
                this.props.messageHandler(testURL, this.props.currentGroup, type)
                this.setState({url: "", error: ""});
            } else {
                this.setState({error: "Invalid url"})
            }
        }
    }

    componentDidMount(){
        document.title = "Chatr Chat Window";
        this.props.initChat()
        this.messageForm.addEventListener("submit", (event)=>{
            event.preventDefault();
            if(this.state.draftMessage){
                this.props.messageHandler(this.state.draftMessage, this.props.currentGroup,  "text");
                this.setState({draftMessage: ""});
            }
        })
        this.textArea.addEventListener("keypress", (event)=>{
            if(event.charCode === 13 && event.shiftKey === false){
                event.target.form.dispatchEvent(new Event("submit", {bubbles: true, cancelable: true}));
                event.preventDefault(); // Prevents the addition of a new line in the text field (not needed in a lot of cases)
            }
        })
        this.props.getGroups(this.props.currentUser._id).then(()=>{
            if(this.props.groups && Object.keys(this.props.groups).length > 0){
                this.props.setCurrentGroup(Object.keys(this.props.groups)[0]);
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

    renderGroups(){
        if(this.props.groups && Object.keys(this.props.groups).length > 0 && !this.props.currentGroup){
            this.props.setCurrentGroup(Object.keys(this.props.groups)[0]);
        }
        return(
            <Accordion style={{marginTop: "16pt", fontSize: "16pt"}} defaultActiveKey="0">
                {
                    Object.values(this.props.groups).map((group, groupKeyVal)=>{
                        return(
                            <Accordion.Item key={groupKeyVal} eventKey={""+groupKeyVal}>
                                <Accordion.Header onClick={()=>{
                                    console.log(this.props.currentGroup, group._id)
                                    if(this.props.currentGroup !== group._id.valueOf()){
                                        this.props.setCurrentGroup(group._id);
                                        this.props.socket.emit("changedGroup", group._id, group.name)
                                    }
                                }}>{group.name}</Accordion.Header>
                                <Accordion.Body>
                                    {
                                        group.students.map((student, studentKeyVal)=>{
                                            return (
                                                <>
                                                <Button variant={
                                                    this.props.activeUsers.map(activeUser => {return activeUser._id}).indexOf(student._id) !== -1
                                                    ? "outline-info"
                                                    : "outline-secondary"
                                                } style={{cursor:"default", margin:"2pt 0", width:"128pt"}} key={2*studentKeyVal}>
                                                    {student.name}
                                                    </Button>
                                                <br key={2*studentKeyVal+1}/>
                                                </>
                                            )
                                        })
                                    }
                                </Accordion.Body>
                            </Accordion.Item>
                        )
                    })
                }
            </Accordion>
        )
    }

    renderMessages(){ // TODO: Convert to message dict
        if(!this.props.messages[this.props.currentGroup]){return;}
        console.log(this.props.messages)
        return this.props.messages[this.props.currentGroup].map((message, keyVal) => {
            return <Message
                socket={this.props.socket}
                currentUser={this.props.currentUser}
                key={keyVal}
                message={message}
            />
        })
    }

    render() {
        return (
            <TemplatePage
                parent = {this}
                currentUser = {this.props.currentUser}
                showSwitch = {this.props.currentUser.isTeacher}
                allowChat = {this.props.allowChat}
                socket = {this.props.socket}
                additionalDropDownItems = {
                    this.props.currentUser.isTeacher
                    ? (<NavigateLink to="/group">
                            <Dropdown.Item>
                                <i className="bi bi-people-fill"/> Groups
                            </Dropdown.Item>
                        </NavigateLink>)
                    : (null)
                }
                errorMessage={this.props.errorMessage}
                setErrorMessage = {this.props.setErrorMessage}
                loginHandler = {this.props.loginHandler}
                updateUserName = {this.props.updateUserName}
            >
                <Row style={{flex: "1 1 auto", width:"100%", overflow:"auto", margin:0}} className="align-items-bottom text-left">
                    <Col md="auto" style={{width: "fit-content", borderRight: "#aaa 2px solid", padding: "8px", display:"flex", flexDirection:"column"}}>
                        {this.renderGroups()}
                    </Col>
                    <Col style = {{display:"flex", flexDirection: "column", width:"80%", padding: "4px 4px 48pt 4px"}} className="align-items-bottom text-left">
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
                                placeholder={(this.props.allowChat || this.props.currentUser.isTeacher)?
                                    "type a message and press enter" : "The teacher has disabled chatting for the moment."}
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
                                            }}  native={true} onEmojiClick={(_, emojiObject) => {
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
                <Row>
                    <Col className="fixed-bottom">
                        <ErrorBox>{this.state.error}</ErrorBox>
                    </Col>
                </Row>
            </TemplatePage>
        );
    }
}

export default ChatPage;
