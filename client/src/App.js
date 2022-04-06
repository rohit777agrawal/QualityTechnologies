import React, { Component } from "react";
import ChatPage from './pages/ChatPage.js';
import LoginPage from "./pages/LoginPage.js";
import "./App.css";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';

const url = "http://localhost:5000/";
//fetch(url + "login/" + localStorage.getItem('login')))

class App extends Component {
    componentDidMount(){
        var id;
        //Verify that a valid login is saved
        if((id = localStorage.getItem('login'))!=''){
            fetch(url + "user/login/" + id)
            .then((res) => res.json())
            .then(json => {
                if(json._id == id){
                    this.setState({loggedIn: true});
                }
            },
            (err) => {
            console.log("err", err);
            })
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            apiResponse: "",
            loggedIn: false,
            loginError: "",
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
        fetch(url + "user/login", requestOptions)
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
            .catch(err => err);

    }

    render(){
        if (this.state.loggedIn){
            return (
                <ChatPage loginUpdater={this.updateLogin.bind(this)}/>
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
