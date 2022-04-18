import React, { Component } from "react";
import { Container, Row, Col, InputGroup, FormControl, Button, Form, Card} from 'react-bootstrap';
// import "./App.css";

class ChatPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            draftMessage: "",
            messages: props.messages
        }

        this.handleMessageInput = this.handleMessageInput.bind(this)
    }

    handleMessageInput(e){
        this.setState({draftMessage: e.target.value})
    }

    renderMessages(){
        if (this.props.messages.length > 0){
            return (
                <Row>
                    <p>{this.state.messages[0].text}</p>
                </Row>

            );
            return <p>{JSON.stringify(this.props.messages)}</p>
        }
        else {
            return <p>no messages yet! {JSON.stringify(this.props)}</p>
        }
    }
    render() {
        return (
            <Container fluid className="vh-100 text-center" >
                <Row className="h-10 bg-dark text-light sticky-top">
                    <Col>
                        <h1>Chatr</h1>
                        <Button variant="outline-danger" size="sm" style={{float: "right", marginTop: 0, marginBottom: "5px"}} type="submit" onClick={(e)=>{
                            localStorage.setItem('login', "")
                            this.props.loginHandler(false)
                        }}>Log Out</Button>
                    </Col>
                </Row>
                <Row className="align-items-bottom">
                    <Col className="align-items-bottom">
                        {this.renderMessages()}
                    </Col>
                </Row>
                <Row className="h-20 fixed-bottom">
                    <Col>
                        <Form>
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
                            send
                            </Button>
                        </InputGroup>
                        </Form>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default ChatPage;
