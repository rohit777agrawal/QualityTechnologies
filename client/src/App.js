import React, { Component } from "react";
import ChatPage from './pages/ChatPage.js';
import LoginPage from "./pages/LoginPage.js";
import "./App.css";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';

const url = "http://localhost:5000/";

class App extends Component {
    componentDidMount(){
        var id;
        //Verify that a valid login is saved
        if((id = localStorage.getItem('login'))!==''){
            fetch(url + "users/" + id)
                .then((res) => res.json())
                .then((json) => {
                    this.setState({loggedIn: json._id === id});
                })
                .catch((err) => {
                    console.error(err);
                })
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            apiResponse: "",
            loggedIn: false,
            loginError: "",
            email: "",
            messages: [{text: "test message", wasSent: true}]
        };
    }
    updateLogin(loginSuccessful){
        this.setState({loggedIn: loginSuccessful} )
        if(!loginSuccessful){
            console.log(this.state.loggedIn);
            this.setState({loginError: ""})
        }
    }

    submitLoginInfo(email, password){
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 'email': email, 'password': password })
        }
        fetch(url + "users/login", requestOptions)
            .then((res) => res.json())
            .then((json) => {
                if(json.text === "success"){
                    this.setState({loggedIn: true})
                    localStorage.setItem('login',json._id)
                }
                else if (json.text === "failure"){
                    this.setState({loginError: "User not found"});
                }
                else{
                    this.setState({loginError: "Unspecified error"});
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }

    sendMessage(text){
        const requestOptions = {
            method: 'Post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({"sender": localStorage.getItem('login'), "recipients": fetch(url+"users/"), "contents": text})
        }
        /*fetch(url + "messages/", requestOptions)
            .then((res) => res.json())
            .then((json) => {
                console.log(json);
            })*/
        this.state.messages.push({
            'text': text,
            'wasSent': Math.random() > 0.5
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
                    loginHandler={this.updateLogin.bind(this)}
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
