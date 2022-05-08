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
        let user;
        try{
            user = JSON.parse(localStorage.getItem('currentUser'));
        } catch(err) {
            user = {} ;
        }
        //Verify that a valid login is saved
        if(user !== null){
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
            messages: [],
            activeUsers: [],
            allowChat: true,
        };

        this.socket = null;

    }

    initChat(){
        this.socket = io(url, {
            auth: {
                token: this.state.currentUser.auth.token
            }
        })

        this.socket.on("setAllowChatFromServer", (allowChat) => {
            this.setState({allowChat: allowChat});
        })

        this.socket.on("activeUsers", (activeUsers) => {
            this.setState({activeUsers: activeUsers});
        })

        this.socket.on('messageFromServer', (message) => {
            //console.log(message);
            let updatedMessages = this.state.messages;
            updatedMessages.push(message);
            this.setState({messages: updatedMessages});
        })

        this.socket.on("messageUpdateFromServer", (message) => {
            let updatedMessages = this.state.messages;
            for(let i = 0; i < updatedMessages.length; i++){
                if(updatedMessages[i].user === message.user && updatedMessages[i].date === message.date){
                    updatedMessages[i] = message;
                    this.setState({messages: updatedMessages});
                    break;
                }
            }
        })

        this.socket.on('updatedUserFromServer', (oldDisplayName, newDisplayName)=>{
            let newMessages = this.state.messages;
            for(let i = 0; i < newMessages.length; i++){
                if(newMessages[i].reactions){
                    for(let j = 0; j < newMessages[i].reactions.length; j++){
                        if(newMessages[i].reactions[j].by === oldDisplayName){
                            newMessages[i].reactions[j].by = newDisplayName;
                        }
                    }
                }
                if(newMessages[i].user === oldDisplayName){
                    newMessages[i].user = newDisplayName;
                }
            }
            this.state.messages.push({
                user: "server",
                text: oldDisplayName + " has changed their name to: " + newDisplayName,
                reactions: []
            })
            this.setState({messages: newMessages});
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
                    localStorage.setItem('currentUser', JSON.stringify(json));
                    this.socket.emit("updatedUserToServer", json.oldDisplayName, json.displayName);
                    this.setState({currentUser: json});
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
        this.socket.emit('messageToServer', msg, type);
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
                    allowChat={this.state.allowChat}
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
