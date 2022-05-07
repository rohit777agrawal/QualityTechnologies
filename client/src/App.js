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
        var user;
        try{
            user = JSON.parse(localStorage.getItem('currentUser'));
        } catch(err) {
            user = {} ;
        }
        //Verify that a valid login is saved
        if(user){
            console.log(user)
            fetch(url + "users/" + user._id)
                .then((res) => res.json())
                .then((json) => {
                    //console.log(json);
                    localStorage.setItem('currentUser', JSON.stringify(user))
                    this.setState({loggedIn: json._id === user._id, currentUser: user});
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
            currentUser: null,
            currentGroup: null,
            messages: [],
            activeUsers: []
        };

        this.socket = null;

    }

    initChat(){
        this.socket = io(url, {
            auth: {
                token: this.state.currentUser.auth.token
            }
        })

        this.socket.on('messageFromServer', (message) => {
            //console.log(message
            let updatedMessages = this.state.messages;
            updatedMessages.push(message);
            this.setState({messages: updatedMessages});
        })

        this.socket.on("messageUpdateFromServer", (message) => {    //TODO: Migrate to message
            let updatedMessages = this.state.messages;
            for(let i = 0; i < updatedMessages.length; i++){
                if(updatedMessages[i].user === message.user && updatedMessages[i].date === message.date){
                    updatedMessages[i] = message;
                    this.setState({messages: updatedMessages});
                    break;
                }
            }
        })

        this.socket.on('activeUsers', users=>{
            this.setState({activeUsers: users})
        })

    }

    updateLoginState(loginSuccessful){
        this.setState({loggedIn: loginSuccessful})
        if(!loginSuccessful){
            //console.log(loginSuccessful);
            this.setState({loginError: ""});
            this.socket.disconnect()
        }
    }

    createNewLogin(userName, email, password){
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({'displayName': userName, 'email': email, 'password': password})
        }
        return new Promise((resolve, reject) =>{
            fetch(url + "users/teacher/", requestOptions)
                .then((res) => {
                    console.log(res);
                    if(res.ok){
                        //console.log("createNewLogin ok")
                        resolve({success: true});
                    } else {
                        throw new Error("Unspecified error");
                    }
                })
                .catch((err) => {
                    console.log("createNewLogin error")
                    reject({success: false, error: err});
                })
        })
    }

    updateLoginInfo(changesDict){
        const requestOptions = {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(changesDict)
        }
        return new Promise((resolve, reject) =>{
            fetch(url + "users/" + changesDict["_id"], requestOptions)
                .then((res)=> res.json())
                .then((json)=>{
                    console.log(json);
                    localStorage.setItem('currentUser', JSON.stringify(json));
                    this.socket.emit("updateActiveUsers");
                    this.socket.emit("sendServerMessage", json.oldDisplayName + " has changed their name to " + json.displayName);  // TODO: Transfer to Message
                    let newMessages = this.state.messages;
                    console.log(newMessages);
                    for(let i = 0; i < newMessages.length; i++){
                        if(newMessages[i].reactions){
                            for(let j = 0; j < newMessages[i].reactions.length; j++){
                                if(newMessages[i].reactions[j].by === json.oldDisplayName){
                                    newMessages[i].reactions[j].by = json.displayName;
                                }
                            }
                        }
                        if(newMessages[i].user === json.oldDisplayName){
                            newMessages[i].user = json.displayName;
                        }
                    }
                    this.setState({currentUser: json, messages: newMessages});
                    resolve(json);
                })
                .catch((err) =>{
                    reject(err);
                })
        })
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
                } else if (res.status === 404){
                    throw new Error("Email or password not found");
                }
                else {
                    throw new Error("Unspecified error");
                }
            })
            .then((user)=>{
                //console.log(user)
                this.setState({currentUser: user, loggedIn: true})
                localStorage.setItem('currentUser', JSON.stringify(user))
            })
            .catch((err) => {
                console.log(err);
                this.setState({loginError: err.message})
            }
        );
    }

    setLoginError(errorMessage){
        this.setState({loginError: errorMessage})
    }

    sendMessage(msg, type) {
        // send messages to message to server-side socket
        console.log("Test:")
        console.log(this.state.currentUser)
        this.socket.emit('messageToServer', msg, this.state.currentUser.displayName, this.state.currentUser._id, this.state.currentGroup?._id, type);
    }
    render(){
        if (this.state.loggedIn){
            return (
                <ChatPage
                    messages={this.state.messages}
                    messageHandler={this.sendMessage.bind(this)}
                    loginHandler={this.updateLoginState.bind(this)}
                    initChat={this.initChat.bind(this)}
                    currentUser={this.state.currentUser}
                    activeUsers={this.state.activeUsers}
                    loginError={this.state.loginError}
                    setLoginError={this.setLoginError.bind(this)}
                    updateLoginInfo={this.updateLoginInfo.bind(this)}
                    socket={this.socket}
                />
            );
        }
        else {
            return (
                <LoginPage
                    loginHandler={this.submitLoginInfo.bind(this)}
                    loginError={this.state.loginError}
                    setLoginError={this.setLoginError.bind(this)}
                    createNewLogin={this.createNewLogin.bind(this)}
                />
            );
        }
    }
}

export default App;
