import React, { Component } from "react";
import { Container, Row, Col, InputGroup, FormControl, Button, Form, Dropdown, Modal} from 'react-bootstrap';
import Message from "../components/Message.js"
import 'bootstrap-icons/font/bootstrap-icons.css';

class ChatPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            draftMessage: "",
            showAccount: true,
            messages: props.messages
        }

        this.handleMessageInput = this.handleMessageInput.bind(this)

    }

    componentDidMount(){
        this.setState({showAccount:false})
        this.props.initChat()
    }

    handleMessageInput(e){
        this.setState({draftMessage: e.target.value})
    }

    renderActiveUsers(){
        return this.props.activeUsers.map((user, keyVal)=>{
            return <p key = {keyVal}>{user.displayName}</p>
        })
    }

    renderMessages(){
        return this.props.messages.map((message, keyVal) => {
            return <Message wasSentByCurrentUser={true} key={keyVal}>{message}</Message>
        })
    }

    render() {
        return (
            <Container fluid className="vh-100 text-center" style={{display: "flex", flexDirection: "column"}} >
                <Row style={{justifyContent: "center"}} className="h-10 bg-dark text-light sticky-top">
                    <Col />
                    <Col>
                        <h1>Chatr</h1>
                    </Col>
                    <Col style={{display:"flex", alignItems: "center", justifyContent:"right"}}>
                        <Dropdown>
                            <Dropdown.Toggle id="dropdown-basic">{this.props.currentUser.displayName}</Dropdown.Toggle>
                            <Dropdown.Menu style={{minWidth: "100%"}}>
                                <Dropdown.Item onClick={()=>{this.setState({showAccount: true})}}>
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
                <Row style={{flex: "1 1 auto"}} className="align-items-bottom text-left">
                    <Col md="auto">
                        {this.renderActiveUsers()}
                    </Col>
                    <Col style = {{display:"flex", flexDirection: "column"}} className="align-items-bottom text-left">
                        {this.renderMessages()}
                    </Col>
                    <Col style = {{width: "10%", backgroundColor: "#ccc"}} />
                </Row>
                <Row className="h-20 fixed-bottom">
                    <Col style = {{width: "10%"}} />
                    <Col>
                        <Form  style = {{backgroundColor: "#fff"}}  >
                            <InputGroup className="mb-3">
                            <FormControl
                                placeholder="type a message and press enter"
                                aria-label="message box"
                                aria-describedby="basic-addon2"
                                id="draftMessage"
                                value={this.state.draftMessage}
                                onChange={this.handleMessageInput}
                                />
                                <Button variant="outline-secondary" id="button-addon2" type="submit" onClick={(e)=>{
                                    e.preventDefault();
                                    // this.state.draftMessage = ""
                                    //console.log(this.state.draftMessage)
                                    this.setState({draftMessage: ""})
                                    this.props.messageHandler(this.state.draftMessage)
                                }}>
                                    Send
                                </Button>
                            </InputGroup>
                        </Form>
                    </Col>
                    <Col style = {{width: "10%"}} />
                </Row>
                <Modal show={this.state.showAccount} onHide={()=>{this.setState({showAccount: false})}}>
                    <Modal.Header closeButton>
                        <Modal.Title style={{textAlign: "center"}}>Account Settings</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Woohoo, you're reading this text in a modal!
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={()=>{this.setState({showAccount: false})}}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={()=>{this.setState({showAccount: false})}}>
                            Save Changes
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        );
    }
}

export default ChatPage;
