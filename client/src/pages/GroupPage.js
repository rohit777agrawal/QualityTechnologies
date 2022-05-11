import { React, Component } from "react";
import { Row } from "react-bootstrap";
import TemplatePage from "./TemplatePage.js";

class GroupPage extends Component {
    constructor(props){
        super(props);
    }
    renderGroups(){
        this.props.groups.forEach((group)=>{
            console.log(group);
        })
    }
    render(){
        return(
            <TemplatePage
                parent = {this}
                currentUser = {this.props.currentUser}
                showSwitch = {false}
                allowChat = {this.props.allowChat}
                socket = {this.props.socket}
                setLoginError = {this.props.setLoginError}
                loginHandler = {this.props.loginHandler}
                updateLoginInfo = {this.props.updateLoginInfo}
            >
                <Row style={{justifyContent: "center", width: "100%", fontSize: "80pt"}}>
                    404
                </Row>
            </TemplatePage>
        )
    }
}

export default GroupPage;
