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
            loggedIn: false
        };
    }

    updateLogin(loginSuccessful){
        this.setState({loggedIn: loginSuccessful})
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
                console.log(res)
                if(res === "success"){
                    console.log("Successfully logged in")
                    this.setState({loggedIn: true})
                    console.log(this.state.loggedIn)
                }
                else{
                    console.log("unsuccessful login")
                }
                
            })
            .catch(err => err);
    }

    render(){
        if (this.state.loggedIn){
            return (
                <ChatPage/>
            );
        }
        else {
            return (
                <LoginPage 
                    loginHandler={this.submitLoginInfo.bind(this)}
                />
            );
        }
    }
}

export default App;