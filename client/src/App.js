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
            messages: {},           // Dictonary of arrays
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

        //if (this.state.currentUser.groupIDs === [] ) { //TODO: have user join groups that he is part of
        //    
        //} else {

        //    // Join all groups user is part of
        //    for (const groupID of this.state.currentUser.groupIDs)
        //        this.socket.emit("joinGroup", groupID)
        //}




        this.socket.on('messageFromServer', (message) => {
            let updatedMessages = this.state.messages[message.groupID];     // Grab current groups messages
            updatedMessages.push(message);
            this.messages.setState({[message.groupID]: updatedMessages});
        })

        this.socket.on("messageUpdateFromServer", (message) => {
            let updatedMessages = this.state.messages[message.groupID];
            for(let updatedMsg in updatedMessages){
                if(updatedMsg.displayName === message.displayName && updatedMsg.sentTime === message.sentTime){
                    updatedMsg = message;
                    this.messages.setState({[message.groupID]: updatedMessages});
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

    updateLoginInfo(changesDict){   // TODO: Migrate to new message
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

                    for (const groupID in this.state.currentUser.groupIDs){
                        let newMessages = this.state.messages[groupID];
                        console.log(newMessages);
                        for(let newMsg in newMessages) {
                            if(newMsg.reactions){
                                for(let reacty in newMsg.reactions) {
                                    if(reacty.by === json.oldDisplayName){
                                        reacty.by = json.displayName;
                                    }
                                }
                            }
                            if(newMsg.user === json.oldDisplayName){
                                newMsg.user = json.displayName;
                            }
                        }
                        this.setState({currentUser: json, messages: newMessages});
                        resolve(json);
                    }

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

    sendMessage(content, messageType, groupID) { // NOTE: Either need to get
        // send messages to message to server-side socket
        this.socket.emit('messageToServer', content, this.state.currentUser.displayName, this.state.currentUser._id, groupID, messageType);
    }

    joinGroups() {  // join all groups in user
        for (const groupID of this.state.currentUser.groupIDs)
            this.socket.emit("joinGroup", groupID)
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
