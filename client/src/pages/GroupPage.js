import { React, Component } from "react";
import { Container, Col, Row } from "react-bootstrap";
import TemplatePage from "./TemplatePage.js";

class GroupPage extends Component {
  render(){
    return(
        <TemplatePage
            parent = {this}
            showSwitch = {false}
            currentUser = {this.props.currentUser}
            allowChat = {this.props.allowChat}
            socket = {this.props.socket}
            setLoginError = {this.props.setLoginError}
            loginHandler = {this.props.loginHandler}
        >
            <Row style={{justifyContent: "center", width: "100%", fontSize: "80pt"}}>
                404
            </Row>
            <Row style={{justifyContent: "center", fontSize: "60pt"}}>
                Error Page
            </Row>
        </TemplatePage>
    )
  }
}

export default GroupPage;
