import React, { Component } from "react";
import { Container, Row, Col, InputGroup, FormControl, Button, Form, Card} from 'react-bootstrap';
import Message from "../components/Message.js"

class ChatPage extends Component {
    componentDidMount(){
        ["Tomorrow will bring something new, so leave today as a memory.", "He stomped on his fruit loops and thus became a cereal killer.", "Each person who knows you has a different perception of who you are.", "Lets all be unique together until we realise we are all the same.", "It was always dangerous to drive with him since he insisted the safety cones were a slalom course.", "You have every right to be angry, but that doesn't give you the right to be mean.", "Her hair was windswept as she rode in the black convertible."].forEach((err, sentence) => {
            this.props.messageHandler(sentence);
        })
    }
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
            var rows = [];
            for(var i = 0; i < this.state.messages.length; i++){
                rows.push(<Message key = {i} wasSent = {this.state.messages[i].wasSent} >
                            <p>{this.state.messages[i].text}</p>
                          </Message>);
            }
            return (
                rows
            );
            return <p>{JSON.stringify(this.props.messages)}</p>
        }
        else {
            return <p>no messages yet! {JSON.stringify(this.props)}</p>
        }
    }
    render() {
        return (
            <Container fluid className="vh-100 text-center" style={{display: "flex", flexDirection: "column"}} >
                <Row style={{justifyContent: "center"}} className="h-10 bg-dark text-light sticky-top">
                    <Col />
                    <Col>
                        <h1>Chatr</h1>
                    </Col>
                    <Col style={{display:"flex", flexDirection: "column", justifyContent:"center"}}>
                        <Button style={{alignSelf: "flex-end"}} variant="outline-danger" size="sm" type="submit" onClick={(e)=>{
                            localStorage.setItem('login', "")
                            this.props.loginHandler(false)
                        }}>Log Out</Button>
                    </Col>
                </Row>
                <Row style = {{flex: "1 1 auto"}}>
                    <Col style = {{width: "10%", backgroundColor: "#ccc"}} />
                    <Col style = {{display: "flex", flexDirection: "column", padding: "4pt 4pt 4pt 4pt"}}>
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
