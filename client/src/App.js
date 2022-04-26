import React, { Component } from "react";
import ChatPage from './pages/ChatPage.js';
import LoginPage from "./pages/LoginPage.js";
import "./App.css";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
import io from "socket.io-client"

const url = "http://localhost:5000/";

// const socket = io(url, {autoConnect: false});

//fetch(url + "login/" + localStorage.getItem('login')))

class App extends Component {
    componentDidMount(){
        
    }

    constructor(props) {
        super(props);

        this.state = {
            apiResponse: "",
            loggedIn: false,
            loginError: "",
            email: "",
            user: null,
            messages: [],
            activeUsers: []
        };

        this.socket = null;

    }

    initChat(){
        this.socket = io(url, {
            auth: {
                token: this.state.user.auth.token
            }
        })

        this.socket.on('messageFromServer', message => {
            //console.log(message);
            var updatedMessages = this.state.messages;
            updatedMessages.push(message);
            this.setState({messages: updatedMessages});        
        })

        this.socket.on('activeUsers', users=>{
            this.setState({activeUsers: users})
        })

    }

    updateLogin(loginSuccessful){
        this.setState({loggedIn: loginSuccessful})
        if(!loginSuccessful){
            console.log(loginSuccessful);
            this.setState({loginError: ""});
            this.socket.disconnect()
        }
    }

    submitLoginInfo(email, password){
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 'email': email, 'password': password })
        }
        fetch(url + "users/login", requestOptions)
            .then((res) =>{
                if (res.ok){
                    return res.json()
                }
                else if (res.status == 404){
                    throw "Email or password not found"
                }
                else {
                    throw "Unspecified error"
                }
            })
            .then((user)=>{
                console.log(user)
                this.setState({user: user})
                this.setState({loggedIn: true})
                localStorage.setItem('login', user._id)
            })
            .catch((err) => {
                console.log(err);
                this.setState({loginError: err})
            }
        );
    }

    sendMessage(text) {
        // send messages to message to server-side socket
        this.socket.emit('messageToServer', text);
    }

    render(){
        if (this.state.loggedIn){
            return (
                <ChatPage
                    messages={this.state.messages}
                    messageHandler={this.sendMessage.bind(this)}
                    loginHandler={this.updateLogin.bind(this)}
                    initChat={this.initChat.bind(this)}
                    user={this.state.user}
                    activeUsers={this.state.activeUsers}
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