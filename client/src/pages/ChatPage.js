import React, { Component } from "react";
import { Container, Row, Col, Button} from 'react-bootstrap';
// import "./App.css";

class ChatPage extends Component {
    render() {
        return (
            <Container fluid className="vh-100 text-center" >
                <Row className="h-10 bg-dark text-light sticky-top">
                    <Col>
                        <h1>Chatr</h1>
                        <Button variant="outline-danger" size="sm" style={{float: "right", marginTop: 0, marginBottom: "5px"}} type="submit" onClick={(e)=>{
                            localStorage.setItem('login', "")
                            this.props.loginUpdater(false)
                        }}>Log Out</Button>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <p>Chat stuff here</p>
                    </Col>
                </Row>
                <Row className="h-20 bg-dark text-light fixed-bottom">
                    <Col>
                        <p>text box will go here</p>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default ChatPage;
