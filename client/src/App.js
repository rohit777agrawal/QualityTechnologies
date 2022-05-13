import React, {Component} from "react";
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import ChatPage from "./pages/ChatPage.js";
import LoginPage from "./pages/LoginPage.js";
import GroupPage from "./pages/GroupPage.js";
import Error404 from "./pages/Error404.js";
import NoPage from "./pages/NoPage.js";
import "./App.css";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
import io from "socket.io-client"

const url = "http://localhost:5000/";

// const socket = io(url, {autoConnect: false});

//fetch(url + "login/" + localStorage.getItem('login')))

class App extends Component {
    validateUser(id) {
        return new Promise((resolve, reject) => {
            fetch(url + "users/" + id).then((res) => res.json()).then((json) => {
                localStorage.setItem('currentUser', JSON.stringify(json));
                this.setState({loggedIn: true, currentUser: json});
                resolve(json)
            }).catch((err) => {
                console.log(err);
                reject(err);
            })
        })
    }

    componentDidMount() {
        //validate the current user
        let user;
        try {
            user = JSON.parse(localStorage.getItem('currentUser'));
        } catch (err) {
            console.log("No valid user saved")
        }
        if (user) {
            this.validateUser(user._id).catch((err) => {
                console.log(err);
            })
        }
    }
    constructor(props) {
        super(props);

        this.state = {
            apiResponse: "",
            loggedIn: false,
            errorMessage: "",
            email: "",
            currentUser: null,
            messages: [],
            groups: [],
            activeUsers: [],
            allowChat: true
        };

        this.socket = null;

    }

    initChat() {
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
            for (let i = 0; i < updatedMessages.length; i++) {
                if (updatedMessages[i].user === message.user && updatedMessages[i].date === message.date) {
                    updatedMessages[i] = message;
                    this.setState({messages: updatedMessages});
                    break;
                }
            }
        })

        this.socket.on('updatedUserFromServer', (oldDisplayName, newUser) => {
            console.log(oldDisplayName, this.state.currentUser.displayName);
            let newMessages = this.state.messages;
            if(oldDisplayName === this.state.currentUser.displayName){
                localStorage.setItem('currentUser', JSON.stringify(newUser));
                this.setState({currentUser: newUser});
            }
            for (let i = 0; i < newMessages.length; i++) {
                if (newMessages[i].user === oldDisplayName) {
                    newMessages[i].user = newUser.displayName;
                }
                if (newMessages[i].reactions) {
                    for (let j = 0; j < newMessages[i].reactions.length; j++) {
                        if (newMessages[i].reactions[j].by === oldDisplayName) {
                            newMessages[i].reactions[j].by = newUser.DisplayName;
                        }
                    }
                }
            }
            this.state.messages.push({
                user: "server",
                text: oldDisplayName + " has changed their name to: " + newUser.displayName,
                reactions: []
            })
            this.setState({messages: newMessages});
        })

    }

    updateLoginState(loginSuccessful) {
        this.setState({loggedIn: loginSuccessful})
        if (!loginSuccessful) {
            //console.log(loginSuccessful);
            this.setState({errorMessage: ""});
            this.socket.disconnect()
        }
    }

    createNewLogin(name, email, password) {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({'name': name, 'email': email, 'password': password})
        }
        return new Promise((resolve, reject) => {
            fetch(url + "users/teacher/", requestOptions)
            .then((res) => {
                if (res.ok) {
                    resolve({success: true});
                } else {
                    throw new Error("Unspecified error");
                }
            }).catch((err) => {
                console.error("There was an error creating a new account");
                reject({success: false, error: err});
            })
        })
    }

    updateUser(changesDict) {
        this.socket.emit("updateUserToServer", changesDict);
    }

    submitLoginInfo(email, password) {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({'email': email, 'password': password})
        }
        fetch(url + "users/login", requestOptions)
        .then((res) => {
            if (res.ok) {
                return res.json()
            } else if (res.status === 404) {
                throw new Error("Email or password not found");
            } else {
                throw new Error("Unspecified error");
            }
        }).then((user) => {
            //console.log(user)
            this.setState({currentUser: user, loggedIn: true})
            localStorage.setItem('currentUser', JSON.stringify(user))
        }).catch((err) => {
            console.log(err);
            this.setState({errorMessage: err.message})
        });
    }

    setErrorMessage(errorMessage) {
        this.setState({errorMessage: errorMessage})
    }

    sendMessage(msg, type) {
        // send messages to message to server-side socket
        this.socket.emit('messageToServer', msg, type);
    }

    createNewGroup(groupName, teacherID) {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: groupName}),
        }
        return new Promise((resolve, reject)=>{
            fetch(url + "users/" + teacherID + "/groups/", requestOptions)
                .then((res) => {
                    if(res.ok){
                        this.getGroups(teacherID);
                        resolve();
                    }  else {
                        throw new Error("Unspecified error");
                    }
                })
                .catch((err) => {
                    reject((err))
                })
        })
    }

    createNewStudent(displayName, teacherID, groupID){
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({displayName: displayName, groupID: groupID}),
        }
        return new Promise((resolve, reject)=>{
            fetch(url + "users/student/", requestOptions)
                .then((res) => {
                    if(res.ok){
                        this.getGroups(teacherID);
                        resolve();
                    }  else {
                        throw new Error("Unspecified error");
                    }
                })
                .catch((err) => {
                    reject((err))
                })
        })
    }

    deleteStudent(studentIDObj, teacherID){
        const requestOptions = {
            method: 'DELETE',
        }
        fetch(url + "users/" + studentIDObj.studentID, requestOptions)
            .then((res) => {
                if(res.ok){
                    this.getGroups(teacherID);
                }  else {
                    throw new Error("Unspecified error");
                }
            })
            .catch((err) => {
                console.error((err))
            })
    }

    getGroups(teacherID){
        fetch(url + "users/" + teacherID + "/groups/")
            .then(async (res) => {
                if(res.ok){
                    this.setState({groups: await res.json()});
                } else if(res.status === 404){
                    this.setState({groups: null})
                }
            })
            .catch((err) => {
                throw (err);
            })

    }

    render() {
        return (<BrowserRouter>
            <Routes>
                <Route index="index" element={
                    this.state.currentUser && this.state.loggedIn
                        ? (<Navigate replace="replace" to="chat"/>)
                        : (<LoginPage
                            allowAccountCreation={false}
                            loginHandler={this.submitLoginInfo.bind(this)}
                            errorMessage={this.state.errorMessage}
                            setErrorMessage={this.setErrorMessage.bind(this)}
                            createNewLogin={this.createNewLogin.bind(this)}
                            />)
                        }/>
                <Route path="login" element={
                    this.state.currentUser && this.state.loggedIn
                        ? (<Navigate replace="replace" to="chat"/>)
                        : (<LoginPage
                            allowAccountCreation={true}
                            loginHandler={this.submitLoginInfo.bind(this)}
                            errorMessage={this.state.errorMessage}
                            setErrorMessage={this.setErrorMessage.bind(this)}
                            createNewLogin={this.createNewLogin.bind(this)}
                        />)
                    }/>
                <Route path="chat" element={
                    this.state.currentUser && this.state.loggedIn
                        ? (<ChatPage
                            currentUser={this.state.currentUser}
                            allowChat={this.state.allowChat}
                            socket={this.socket}
                            setErrorMessage={this.setErrorMessage.bind(this)}
                            loginHandler={this.updateLoginState.bind(this)}
                            groups={this.state.groups}
                            updateUser={this.updateUser.bind(this)}
                            messages={this.state.messages}
                            messageHandler={this.sendMessage.bind(this)}
                            initChat={this.initChat.bind(this)}
                            activeUsers={this.state.activeUsers}
                            errorMessage={this.state.errorMessage}/>)
                        : (<Navigate replace="replace" to="/"/>)
                }/>
                <Route path="group" element={
                    this.state.currentUser
                    ? (<GroupPage
                            currentUser={this.state.currentUser}
                            allowChat={this.state.allowChat}
                            socket={this.socket}
                            setErrorMessage={this.setErrorMessage.bind(this)}
                            loginHandler={this.updateLoginState.bind(this)}
                            groups={this.state.groups}
                            parent={this}
                            updateUser={this.updateUser.bind(this)}
                            getGroups={this.getGroups.bind(this)}
                            createNewGroup={this.createNewGroup.bind(this)}
                            createNewStudent={this.createNewStudent.bind(this)}
                            pageURL={url}
                            errorMessage={this.state.errorMessage}/>)
                    : (<Navigate replace="replace" to="/"/>)
                }/>
                <Route path="error404" element={<Error404/>}/>
                <Route path="*" element={<NoPage validateUser = {
                        this.validateUser.bind(this)
                    } />}/>
            </Routes>
        </BrowserRouter>)
    }
}

export default App;
