import React, {Component} from "react";
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import ChatPage from "./pages/ChatPage.js";
import LoginPage from "./pages/LoginPage.js";
import GroupsPage from "./pages/GroupsPage.js";
import Error404 from "./pages/Error404.js";
import NoPage from "./pages/NoPage.js";
import "./App.css";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
import io from "socket.io-client"

const clientURL = "http://localhost:3000/"
const serverURL = "http://localhost:5000/";
const GROUPID = "1"

<<<<<<< HEAD
=======
//TODO:
// Move reactions to use ID instead of name

const url = "http://localhost:5000/";

// const socket = io(url, {autoConnect: false});

//fetch(url + "login/" + localStorage.getItem('login')))

>>>>>>> main
class App extends Component {
    validateUser(id) {
        return new Promise((resolve, reject) => {
            fetch(serverURL + "users/" + id).then((res) => res.json()).then((json) => {
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
<<<<<<< HEAD
            messages: [],
            students: [],
            groups: [],
            activeUsers: [],
            //messages: {},   // messages, users, groups are intended to be a dictionary of arrays that store the given type
            //users: {},
            //gorups: {},
            allowChat: true
=======
            messages: {},   // messages, users, groups are intended to be a dictionary of arrays that store the given type
            users: {},
            gorups: {},
            activeUsers: []
>>>>>>> main
        };

        this.socket = null;

    }

    initChat() {
        if(this.socket){return;}
        this.socket = io(serverURL, {
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

        this.socket.on("updatedMessage", (message) => {  // TODO: Convert to Message dictionary
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

        this.socket.on('updatedUser', (oldName, updatedUser) => {
            let newMessages = this.state.messages;
            if(oldName === this.state.currentUser.name){
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                this.setState({currentUser: updatedUser});
                console.log("these should be different", oldName, this.state.currentUser.name)
            }
            for (let i = 0; i < newMessages.length; i++) {
                if (newMessages[i].user === oldName) {
                    newMessages[i].user = updatedUser.name;
                }
            }
            this.state.messages.push({
                user: "server",
                text: oldName + " has changed their name to: " + updatedUser.name,
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
<<<<<<< HEAD
        return new Promise((resolve, reject) => {
            fetch(serverURL + "users/teacher/", requestOptions)
            .then((res) => {
                if (res.ok) {
                    resolve({success: true});
                } else {
=======
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
>>>>>>> main
                    throw new Error("Unspecified error");
                }
            }).catch((err) => {
                console.error("There was an error creating a new account");
                reject({success: false, error: err});
            })
        })
    }

    updateUserName(newName) {
        this.socket.emit("updateUserName", this.state.currentUser.name, newName);
    }

    submitLoginInfo(email, password) {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({'email': email, 'password': password})
        }
        fetch(serverURL + "users/login", requestOptions)
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
        this.socket.emit('message', msg, this.state.currentUser._id, GROUPID, type);
    }
<<<<<<< HEAD

    createNewGroup(groupName, teacherID) {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: groupName}),
=======
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
>>>>>>> main
        }
        return new Promise((resolve, reject)=>{
            fetch(serverURL + "users/" + teacherID + "/groups/", requestOptions)
                .then((res) => {
                    if(res.ok){
                        this.getTeachersGroups(teacherID);
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

    updateGroupStudents(groupID, userIDs, teacherID){
        const requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userIDs),
        }
        return new Promise((resolve, reject)=>{
            fetch(serverURL + "groups/" + groupID + "/update", requestOptions)
                .then((res) => {
                    if(res.ok){
                        this.getTeachersGroups(teacherID);
                        this.getAllStudents();
                        resolve();
                    }  else {
                        throw new Error("Unspecified error");
                    }
                })
                .catch((err) => {
                    reject((err))
                })
        })
    }j

    async createNewStudent(name, teacherID, groupID){
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: name, groupID: groupID}),
        }
        return fetch(serverURL + "users/student/", requestOptions)
            .then((res) => {
                if(res.ok){
                     this.getTeachersGroups(teacherID);
                     this.getAllStudents();
                 }  else {
                     throw new Error("Unspecified error");
                 }
             })
             .catch((err) => {
                 return err
             })
    }

    deleteStudent(studentID, teacherID){
        const requestOptions = {
            method: 'DELETE',
        }
        fetch(serverURL + "users/" + studentID, requestOptions)
            .then((res) => {
                if(res.ok){
                    this.getTeachersGroups(teacherID);
                    this.getAllStudents();
                }  else {
                    throw new Error("Unspecified error");
                }
            })
            .catch((err) => {
                console.error((err))
            })
    }

    deleteGroup(groupID, teacherID){
        const requestOptions = {
            method: 'DELETE',
        }
        fetch(serverURL + "groups/" + groupID, requestOptions)
            .then((res) => {
                if(res.ok){
                    this.getTeachersGroups(teacherID);
                    this.getAllStudents();
                }  else {
                    throw new Error("Unspecified error");
                }
            })
            .catch((err) => {
                console.error((err))
            })
    }

    async getTeachersGroups(teacherID){
        return await fetch(serverURL + "users/" + teacherID + "/groups/")
            .then(async (res) => {
                if(res.ok){
                    this.setState({groups: await res.json()});
                } else if(res.status === 404){
                    this.setState({groups: null})
                }
            })
            .catch((err) => {
                this.setState({errorMessage: err.message});
            })

    }

    async getAllStudents(){
        return await fetch(serverURL + "users/students")
            .then(async (res) => {
                if(res.ok){
                    this.setState({students: await res.json()})
                } else if(res.status === 404){
                    this.setState({students: null})
                }
            })
            .catch((err) => {
                this.setState({errorMessage: err.message});
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
                            errorMessage={this.state.errorMessage}
                            setErrorMessage={this.setErrorMessage.bind(this)}
                            loginHandler={this.updateLoginState.bind(this)}
                            groups={this.state.groups}
                            updateUserName={this.updateUserName.bind(this)}
                            messages={this.state.messages}
                            messageHandler={this.sendMessage.bind(this)}
                            initChat={this.initChat.bind(this)}
                            activeUsers={this.state.activeUsers}/>)
                        : (<Navigate replace="replace" to="/"/>)
                }/>
                <Route path="group" element={
                    this.state.currentUser
                    ? (<GroupsPage
                            currentUser={this.state.currentUser}
                            allowChat={this.state.allowChat}
                            socket={this.socket}
                            setErrorMessage={this.setErrorMessage.bind(this)}
                            loginHandler={this.updateLoginState.bind(this)}
                            loggedIn={this.state.loggedIn}
                            updateUserName={this.updateUserName.bind(this)}
                            groups={this.state.groups}
                            getTeachersGroups={this.getTeachersGroups.bind(this)}
                            createNewGroup={this.createNewGroup.bind(this)}
                            deleteGroup={this.deleteGroup.bind(this)}
                            students={this.state.students}
                            getAllStudents={this.getAllStudents.bind(this)}
                            updateGroupStudents={this.updateGroupStudents.bind(this)}
                            deleteStudent={this.deleteStudent.bind(this)}
                            createNewStudent={this.createNewStudent.bind(this)}
                            pageURL={clientURL}
                            errorMessage={this.state.errorMessage}
                        />)
                    : (<Navigate replace="replace" to="/"/>)
                }/>
                <Route path="error404" element={<Error404/>}/>
                <Route path="*" element={
                    <NoPage validateUser = {
                        this.validateUser.bind(this)
                    }/>
                }/>
            </Routes>
        </BrowserRouter>)
    }
}

export default App;
