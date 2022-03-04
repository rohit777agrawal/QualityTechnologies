import React, { Component } from "react";
import { Container, Row, Col} from 'react-bootstrap';
import logo from "./logo.svg";
import "./App.css";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { apiResponse: "" };
    }

    callAPI() {
        fetch("http://localhost:5000/testAPI")
            .then(res => res.text())
            .then(res => this.setState({ apiResponse: res }))
            .catch(err => err);
    }

    componentDidMount() {
        this.callAPI();
    }

    render() {
        return (
            <div className="App">
                <Container>
                <Row>
                    <h2 className="App-title">Welcome to Chatr</h2>
                </Row>
                <Row fluid>
                    
                </Row>
                <Row>
                    <p>Text entry will go here</p>
                </Row>
                </Container>
                {/* <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h1 className="App-title">Welcome to Chatr</h1>
                </header>
                <p className="App-intro">{this.state.apiResponse}</p> */}
            </div>
        );
    }
}

export default App;