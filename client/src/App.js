import React, { Component } from "react";
import ChatPage from './pages/ChatPage.js';
import LoginPage from "./pages/LoginPage.js";
import "./App.css";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
import io from "socket.io-client"

const GROUPID = "1"

//TODO:
// Move reactions to use ID instead of name

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
            messages: {},   // messages, users, groups are intended to be a dictionary of arrays that store the given type
            users: {},
            groups: {},
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

        this.socket.on('message', (message) => {
            let updatedMessages = this.state.messages[message.groupID];
            if(!updatedMessages)
                updatedMessages = [];
            updatedMessages.push(message)

            this.setState({
                ...this.state,
                messages: {
                    ...this.state.messages,
                    [message.groupID]: updatedMessages
                }
            })
        })

        this.socket.on("updateMessage", (message) => {  // TODO: Convert to Message dictionary
            let updatedMessages = this.state.messages[message.groupID];


            for(var msg of updatedMessages) {
                if(msg.senderID === message.senderID && msg.timeSent === message.timeSent) { // isMatching
                    msg = message;
                    break;
                }
            }

            this.setState({
                ...this.state,
                messages: {
                    ...this.state.messages,
                    [message.groupID]: updatedMessages
                }
            })
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

    createNewLogin(name, email, password){
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({'name': name, 'email': email, 'password': password})
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
        console.log(changesDict)
        const requestOptions = {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(changesDict)
        }
        return new Promise((resolve, reject) =>{
            const oldName = this.state.currentUser.name
            fetch(url + "users/" + this.state.currentUser._id, requestOptions)
                .then((res)=> res.json())
                .then((json)=>{
                    console.log(json);
                    localStorage.setItem('currentUser', JSON.stringify(json));
                    // this.socket.emit("updateUser", oldName, json.displayName, ())
                    this.socket.emit("updateUser", oldName, json.displayName);
                    // this.socket.emit("message", oldName + " has changed their name to " + json.displayName);
                    
                    let allMessages = this.state.messages; 
                    console.log(allMessages)
                    for(let groupMsg in allMessages) {  // I will be shocked if this works properly :')
                        for(let msg in groupMsg) {
                            if(msg.reactions) {
                                for(let reaction in msg.reactions) {
                                    if(reaction.by === json.oldDisplayName) {
                                        reaction.by = json.displayName;
                                    }
                                }
                            }
                        }
                    }
                    this.setState({
                        messages: allMessages,
                        currentUser: json,          // I just copied this from the previous one, honestly can't tell why it is here rn ¯\_(ツ)_/¯
                    })
                    resolve(json);
                })
                .catch((err) =>{
                    reject(err);
                })
        })
    }

    updateGroups(){
        const requestOptions = {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        } 
        fetch(url + "users/" + this.state.currentUser._id + "/groups", requestOptions)
        .then((res)=>{
            if (res.ok) {
                return res.json()
            }
        })
        .then((groups)=>{
            let groupMap = {}
            for (let group of groups){
                groupMap[group._id] = group
            }
            this.setState({groups: groupMap})
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
                this.setState({
                    loggedIn: true,
                    currentUser: user,
                })
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
        this.socket.emit('message', msg, this.state.currentUser._id, GROUPID, type);
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
                    currentGroup={this.state.currentGroup}
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
