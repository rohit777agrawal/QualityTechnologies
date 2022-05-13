import { React, Component } from "react";
import { Col, Row, Form, Accordion, Dropdown, Table, Button, Modal} from "react-bootstrap";
import { Navigate } from "react-router-dom";
import TemplatePage from "./TemplatePage.js";
import NavigateLink from "../components/NavigateLink";

class GroupPage extends Component {
    constructor(props){
        super(props);
        this.state = {
            selectedTeacher: this.props.currentUser._id,
            nameDraft: "",
            showModal: true,
            createType: "Group",
            studentGroupID: null,
        }
    }
    componentDidMount(){
        if(!this.props.currentUser
            || !this.props.parent.state.loggedIn
            || !this.props.currentUser.isTeacher)
            {
            return(<Navigate replace="replace" to="/chat"/>)
        } else {
            this.setState({showModal: false});
            this.props.getGroups(this.props.currentUser._id);
        }
    }

    handleNameChange(event){
        this.setState({nameDraft: event.target.value})
    }

    handleSubmit(event){
        event.preventDefault();
        const nameRegex = /^[A-z0-9_-]{3,15}$/;
        try{
            if(this.state.nameDraft.match(nameRegex) === null){
                if(this.state.nameDraft.length < 3 || this.state.groupNameDraft.length > 15){
                    throw new Error("Names must be 3 to 15 characters long.");
                } else {
                    throw new Error("Names cannot have special characters.")
                }
            }
            switch(this.state.createType){
                case "Group":
                    this.props.createNewGroup(this.state.nameDraft, this.props.currentUser._id)
                    .then(() => {
                        this.setState({nameDraft: "", showModal: false});
                    })
                    .catch((err) => {
                        throw err;
                    })
                    break;
                case "Student":
                    this.props.createNewStudent(this.state.nameDraft, this.props.currentUser._id, this.state.studentGroupID)
                    .then(() => {
                        this.setState({nameDraft: "", showModal: false});
                    })
                    .catch((err) => {
                        throw err;
                    })
                    break;
                default:
                    throw new Error("Invalid object type");
            }
        } catch(error) {
            this.props.setErrorMessage(error.message);
        }
    }

    getTeacherOptions(){
        return (<option>{this.props.currentUser.displayName}</option>)
    }

    renderGroups(){
        if(this.props.groups && this.props.groups.length !== 0){
            return (
                <Accordion defaultActiveKey="0">
                    {
                        this.props.groups.map((group, i) => {
                            return (
                                <Accordion.Item key={i} eventKey={""+i}>
                                    <Accordion.Header> {group.name} </Accordion.Header>
                                    <Accordion.Body>
                                    <Table striped border="true" style={{fontSize: "16pt", marginTop: "16pt"}}>
                                        {group.userIDs.length === 0
                                        ? (<tbody><tr>
                                            <td>
                                                This group does not have any students
                                                    <Button variant="outline-success" style={{marginLeft: "16pt"}} onClick={()=>{
                                                        this.setState({showModal: !this.state.showModal, createType: "Student", studentGroupID: group._id});
                                                    }}>
                                                        Create One <i className="bi bi-plus-circle"/>
                                                    </Button>
                                            </td>
                                            </tr></tbody>)
                                        : (
                                            <>
                                            <thead><tr>
                                                <th>#</th>
                                                <th>Name</th>
                                                <th>Link</th>
                                                <th/>
                                            </tr></thead>
                                            <tbody>{group.userIDs.map((id, j)=>{
                                                return (
                                                    <tr key={j}>
                                                        <td>{j}</td>
                                                        <td>{this.props.pageURL+id}</td>
                                                        <td/>
                                                        <td>
                                                            <Button variant="outline-danger" style={{marginLeft: "16pt"}} onClick={()=>{
                                                                this.props.deleteStudent({studentID: j});
                                                            }}>
                                                                Delete <i className="bi bi-trash"/>
                                                            </Button>
                                                        </td>
                                                    </tr>);
                                            })}
                                            <tr><td/><td>
                                                <Button variant="outline-success" style={{marginLeft: "16pt"}} onClick={()=>{
                                                    this.setState({showModal: !this.state.showModal, createType: "Student", studetnGroupID: group._id});
                                                }}>
                                                    Create new Student <i className="bi bi-plus-circle"/>
                                                    </Button>
                                            </td><td/><td/></tr></tbody>
                                            </>
                                        )}
                                    </Table>
                                    </Accordion.Body>
                                </Accordion.Item>
                            )
                        })
                    }
                </Accordion>
            )

        } else {
            return (
                <Table striped border="true" style={{fontSize: "16pt", marginTop: "16pt"}}>
                    <tbody>
                        <tr>
                            <td>You do not have any groups.
                                <Button variant="outline-success" style={{marginLeft: "16pt"}} onClick={()=>{
                                    this.setState({showModal: !this.state.showModal, createType: "Group"});
                                }}>
                                    Create One <i className="bi bi-plus-circle"/>
                                </Button>
                            </td>
                        </tr>
                    </tbody>
                </Table>
            )
        }
    }
    render(){
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
                            <i className="bi bi-chat"/> Chat
                        </Dropdown.Item>
                    </NavigateLink>
                }
                setErrorMessage = {this.props.setErrorMessage}
                loginHandler = {this.props.loginHandler}
                updateLoginInfo = {this.props.updateLoginInfo}
            >
                <Row style={{justifyContent: "center", width: "100%", fontSize: "80pt"}}>
                    <Col/>
                    <Col>
                        {this.renderGroups()}
                    </Col>
                    <Col/>
                </Row>
                <Modal show={this.state.showModal} onHide={()=>{this.setState({showModal: false})}}>
                    <Modal.Header closeButton>
                        <Modal.Title style={{textAlign: "center"}}> Create a new {this.state.createType} </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    <Form target="">
                        <Form.Group className="mb-3">
                            <Form.Label>{this.state.createType} Name</Form.Label>
                            <Form.Control placeholder={this.state.createType+"Name"} onChange={(e)=>{this.handleNameChange(e)}}/>
                            <Form.Label style={{color:"#f44"}}>{this.props.errorMessage}</Form.Label>
                        </Form.Group>
                        <div style={{display:"flex", justifyContent:"space-evenly"}}>
                        <Button variant="secondary" onClick={()=>{this.setState({showModal:false})}}>
                        Close
                        </Button>
                        <Button variant="primary" type="submit" onClick={(e)=>{
                            this.handleSubmit(e);
                        }}>
                            Save
                        </Button>
                        </div>
                    </Form>
                    </Modal.Body>
                </Modal>
            </TemplatePage>
        )
    }
}

export default GroupPage;
