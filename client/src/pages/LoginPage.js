import React, { Component } from "react";
import { Container, Row, Col, Button, Form} from 'react-bootstrap';
import ErrorBox from '../components/ErrorBox.js'

class LoginPage extends Component {
    componentDidMount(){
        document.title = "Login to Chatr";
    }

    constructor(props) {
        super(props);
        this.state = {
            createAccount: false,
            apiResponse: "",
            userName: "",
            email: "",
            password: "",
        };
    }

    handleUserNameInput(event){
        this.setState({userName: event.target.value});
    }

    handleEmailInput(event){
        this.setState({email: event.target.value});
    }

    handlePasswordInput(event){
        this.setState({password: event.target.value});
    }

    handleSubmit(event){
        const userNameRegex = /^[A-z0-9_-]{3,15}$/;
        const emailRegex    = /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/;
        const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/;
        if(!this.state.createAccount){
            event.preventDefault();
            this.props.loginHandler(this.state.email, this.state.password);
        } else {
            this.props.setLoginError("");
            try{
                if(this.state.userName.match(userNameRegex)===null){
                    throw new Error("Please try a better username");
                }
                if(this.state.email.match(emailRegex)===null){
                    throw new Error("Your email's not looking right");
                }
                if(this.state.password.match(passwordRegex)===null){
                    throw new Error("Passwords must be 8 characters long, have one upper and lowercase letter, and one number");
                }
                this.props.createNewLogin(this.state.userName, this.state.email, this.state.password);
            } catch(error){
                event.preventDefault();
                this.props.setLoginError(error.message);
            }
        }
    }

    render() {
        return (
            <>
                <Container fluid className="vh-100 text-center col-3">
                    <Row className="h-100 justify-content-center align-items-center">
                        <Col className="w-100">
                          <h1>{!this.state.createAccount?"Chatr":"Create a new Account"}</h1>
                          <Form className="" target="">
                            <Form.Group hidden={!this.state.createAccount} className="mb-3">
                                <Form.Label>User Name</Form.Label>
                                <Form.Control placeholder="User Name" onChange={(e)=>{this.handleUserNameInput(e)}}/>
                            </Form.Group>
                            <Form.Group className="mb-3">
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
                            <Button
                                variant="secondary" style={{float:"left"}}
                                onClick={(e)=>{this.setState({createAccount: !this.state.createAccount})}}
                            >
                                {!this.state.createAccount?"Create Account":"Back"}
                            </Button>
                            <Button variant="primary" style={{float: "right"}}
                                type="submit" onClick={(e) => {this.handleSubmit(e)}}
                            >
                                {!this.state.createAccount?"Submit":"Create Acount"}
                            </Button>
                        </Form>
                        </Col>
                    </Row>
                    <Row >
                        <Col className="fixed-bottom">
                            <ErrorBox>{this.props.loginError}</ErrorBox>
                        </Col>
                    </Row>
                </Container>
            </>
        );
    }
}

export default LoginPage;
