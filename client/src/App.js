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
                if(res === "success"){
                    this.setState({loggedIn: true})
                    localStorage.setItem('loggedIn',JSON.stringify(this.state.loggedIn))
                    
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
                    loginError={this.state.loginError}
                />
            );
        }
    }
}

export default App;