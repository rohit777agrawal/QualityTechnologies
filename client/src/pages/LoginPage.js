import React, { Component } from "react";
import { Container, Row, Col, Card, Button, Form} from 'react-bootstrap';

class LoginPage extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            apiResponse: "",
            email: "",
            password: ""
        };
    }

    handleEmailInput(event){
        this.setState({ email: event.target.value })
    }

    handlePasswordInput(event){
        this.setState({password: event.target.value})
    }

    render() {
        return (
            <div>
                <Container fluid className="vh-100 text-center" >
                    <Row className="fixed-top"><h3>Chatr</h3></Row>
                    <Row className="h-100 align-items-center col-3">
                        {/* <Col></Col> */}
                        <Col className="w-100">
                        <Form className="">
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control type="email" placeholder="Enter email"  onChange={(e)=>{this.handleEmailInput(e)}} />
                            <Form.Text className="text-muted">
                            We'll never share your email with anyone else.
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" placeholder="Password" onChange={(e)=>{this.handlePasswordInput(e)}}/>
                        </Form.Group>
                        <Button variant="primary" type="submit" 
                        onClick={()=>{
                            this.props.loginHandler(this.state.email, this.state.password)
                        }}
                        >
                            Submit
                        </Button>
                        <p className="text-warn">{this.props.loginError}</p>
                        </Form>
                        </Col>
                        {/* <Col></Col> */}
                    </Row>
                    <Row >
                        <Col className="fixed-bottom">{this.state.email + " " + this.state.password}</Col>
                    </Row>
                </Container>
                
            </div>
        );
    }
}

export default LoginPage;