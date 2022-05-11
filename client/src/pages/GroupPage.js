import { React, Component } from "react";
import { Row, Dropdown } from "react-bootstrap";
import { Navigate } from "react-router-dom";
import TemplatePage from "./TemplatePage.js";
import NavigateLink from "../components/NavigateLink";

class GroupPage extends Component {
    componentDidMount(){
        if(!this.props.currentUser
            || !this.props.parent.state.loggedIn
            || !this.props.currentUser.isTeacher)
            {
            return(<Navigate replace="replace" to="/chat"/>)
        }
    }
    renderGroups(){
        this.props.groups.forEach((group)=>{
            console.log(group);
        })
    }
    render(){
        console.log(this.props.currentUser)
        return(
            <TemplatePage
                parent = {this}
                currentUser = {this.props.currentUser}
                showSwitch = {false}
                allowChat = {this.props.allowChat}
                socket = {this.props.socket}
                additionalDropDownItems = {
                    <NavigateLink to="/chat">
                        <Dropdown.Item>
                            <i class="bi bi-chat"/> Chat
                        </Dropdown.Item>
                    </NavigateLink>
                }
                setLoginError = {this.props.setLoginError}
                loginHandler = {this.props.loginHandler}
                updateLoginInfo = {this.props.updateLoginInfo}
            >
                <Row style={{justifyContent: "center", width: "100%", fontSize: "80pt"}}>
                    {this.renderGroups()}
                </Row>
            </TemplatePage>
        )
    }
}

export default GroupPage;
