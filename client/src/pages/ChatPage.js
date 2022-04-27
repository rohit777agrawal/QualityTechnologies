import React, { Component } from "react";
import { Container, Row, Col, InputGroup, FormControl, Button, Form, Card} from 'react-bootstrap';
import Message from "../components/Message.js"

class ChatPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      draftMessage: "",
      messages: props.messages
    }

    this.handleMessageInput = this.handleMessageInput.bind(this)

  }

  componentDidMount(){
    this.props.initChat()
  }

  handleMessageInput(e){
    this.setState({draftMessage: e.target.value})
  }

  renderActiveUsers(){
      return this.props.activeUsers.map((user)=>{
          return <p>{user.displayName}</p>
      })
  }

  renderMessages(){
    return this.props.messages.map((message) => {
      return <p>{message.user}: {message.text}</p>
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
                    <Col style={{display:"inline-block", flexDirection: "column", justifyContent:"right"}}>
                        <p style={{display:"inline-block"}}>{this.props.user.displayName}</p>
                        <Button style={{alignSelf: "flex-end"}} variant="outline-danger" size="sm" type="submit" onClick={(e)=>{
                            localStorage.setItem('login', "")
                            this.props.loginHandler(false)
                        }}>Log Out</Button>
                    </Col>
                </Row>
                <Row className="align-items-bottom text-left">
                    <Col md="auto">
                        {this.renderActiveUsers()}
                    </Col>
                    <Col className="align-items-bottom text-left">
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
                                    console.log(this.state.draftMessage)
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
            </Container>
        );
    }
}

export default ChatPage;
