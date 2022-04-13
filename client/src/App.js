import React, { Component } from "react";
import ChatPage from './pages/ChatPage.js';
import LoginPage from "./pages/LoginPage.js";
import "./App.css";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            apiResponse: "",
            loggedIn: localStorage.getItem('loggedIn') ? JSON.parse(localStorage.getItem('loggedIn')) : false ,
            loginError: "",
            email: "",
            messages: [{text: "test message"}]
        };
    }

    onSuccessfulLogin(email){
        this.setState({loggedIn: true})
        localStorage.setItem('loggedIn',JSON.stringify(this.state.loggedIn))
        this.setState({email: email})
    }

    submitLoginInfo(email, password){
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 'email': email, 'password': password })
        }

        fetch("http://localhost:5000/login", requestOptions)
            .then(res => res.text())
            .then(res => {
                if(res === "success"){
                    this.onSuccessfulLogin(email)
                }
                else if (res === "failure"){
                    this.setState({loginError: "User not found"});
                }
                else{
                    this.setState({loginError: "Unspecified error"});
                }
                
            })
            .catch(err => err);
    }

    sendMessage(text){
        this.state.messages.push({
            'text': text,
            // name: this.state.email
        })
        console.log(this.state.messages)
    }

    render(){
        if (this.state.loggedIn){
            return (
                <ChatPage
                    messages={this.state.messages}
                    messageHandler={this.sendMessage.bind(this)}
                />
            );
        }
        else {
            return (
                <LoginPage 
                    loginHandler={this.submitLoginInfo.bind(this)}
                    loginError={this.state.loginError}
                />
            );
        }
    }
}

export default App;