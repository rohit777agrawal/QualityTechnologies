import React, { Component } from "react";
import { Container, Row, Col} from 'react-bootstrap';
// import "./App.css";

class ChatPage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Container fluid className="vh-100 text-center" >
                <Row className="h-10 bg-dark text-light sticky-top">
                    <Col>
                        <h3>Chatr</h3>
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