import { React, Component } from "react";
import { Col, Row, Form, Accordion, Dropdown, Table, Button, OverlayTrigger, Popover} from "react-bootstrap";
import { Navigate } from "react-router-dom";
import TemplatePage from "./TemplatePage.js";
import ColoredButton from "../components/ColoredButton.js";
import ModalTemplate from "../components/ModalTemplate.js"
import NavigateLink from "../components/NavigateLink.js";

class GroupsPage extends Component {
    constructor(props){
        super(props);
        this.state = {
            selectedTeacher: this.props.currentUser._id,
            nameDraft: "",
            showModal: true,
            creating: true,
            createType: "Group",
            students: [],
            studentsToAdd: [],
            selectedGroup: null,
            buttonWidth: 0,
        }
    }
    componentDidMount(){
        if(!this.props.currentUser
            || !this.props.loggedIn
            || !this.props.currentUser.isTeacher)
            {
            return(<Navigate replace="replace" to="/chat"/>)
        } else {
            this.setState({showModal: false});
            this.props.getTeachersGroups(this.props.currentUser._id);
            this.props.getAllStudents();
        }
    }

    handleNameChange(event){
        this.setState({nameDraft: event.target.value})
    }

    handleCreateSubmit(event){
        event.preventDefault();
        const nameRegex = /^[A-z0-9_-]{3,15}$/;
        try{
            if(this.state.nameDraft.match(nameRegex) === null){
                if(this.state.nameDraft.length < 3 || this.state.nameDraft.length > 15){
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
                    this.props.createNewStudent(this.state.nameDraft, this.props.currentUser._id, this.state.selectedGroup)
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
            console.log(error);
            this.props.setErrorMessage(error.message);
        }
    }

    getTeacherOptions(){
        return (<option>{this.props.currentUser.name}</option>)
    }

    renderGroups(){
        if(this.props.groups && this.props.groups.length !== 0){
            return (
                <>
                <Accordion style={{marginTop: "16pt", fontSize: "16pt"}} defaultActiveKey="0">
                    {
                        Object.entries(this.props.groups).map(([id, group], i) => {
                            return (
                                <Accordion.Item key={i} eventKey={""+i}>
                                    <Accordion.Header>Group: {group.name} </Accordion.Header>
                                    <Accordion.Body>
                                    <Table striped border="true" style={{fontSize: "16pt", marginTop: "16pt"}}>
                                        {group.students.length === 0
                                        ? (<tbody><tr>
                                            <td>
                                                This group does not have any students
                                                <Button variant="outline-secondary" style={{marginLeft:"16pt"}} onClick={()=>{
                                                    this.setState({showModal: true, creating: false, selectedGroup: id});
                                                }}>
                                                    Add existing Students <i className="bi bi-people"/>
                                                </Button>
                                                <Button variant="outline-success" style={{marginLeft: "16pt"}} onClick={()=>{
                                                    this.setState({showModal: true, creating: true, createType: "Student", selectedGroup: id});
                                                }}>
                                                    Create One <i className="bi bi-person-plus"/>
                                                </Button>
                                                <Button variant="outline-danger" style={{marginLeft: "16pt"}} onClick={()=>{
                                                    this.props.deleteGroup(this.props.groups[i]._id, this.props.currentUser._id)
                                                }}>
                                                    Delete this group <i className="bi bi-trash"/>
                                                </Button>
                                            </td>
                                            </tr></tbody>)
                                        : (
                                            <>
                                            <thead><tr>
                                                <th>#</th>
                                                <th>Name</th>
                                                <th>Link</th>
                                                <th colSpan="100%"/>
                                            </tr></thead>
                                            <tbody>{group.students.map((student, j)=>{
                                                return (
                                                    <tr key={j}>
                                                        <td>{j}</td>
                                                        <td>{student.name}</td>
                                                        <td>{this.props.pageURL+student._id}</td>
                                                        <td>
                                                            <Button variant="outline-danger" style={{marginLeft: "16pt"}} onClick={()=>{
                                                                let changedStudents = group.userIDs;
                                                                changedStudents.splice(changedStudents.indexOf(student._id), 1);
                                                                this.props.updateGroupStudents(group._id, changedStudents, this.props.currentUser._id);
                                                            }}>
                                                                Remove<i className="bi bi-x-circle"/>
                                                            </Button>
                                                        </td>
                                                        <td>
                                                            <OverlayTrigger
                                                            trigger="click"
                                                            placement="right"
                                                            overlay={
                                                                <Popover>
                                                                    <Popover.Header>Confirmation</Popover.Header>
                                                                    <Popover.Body>
                                                                        Are you sure you want to <button style={{color:"#f00", border:"none", backgroundColor: "#fff", padding: 0}} href="" onClick={(e)=>{e.preventDefault();this.props.deleteStudent(student._id, this.props.currentUser._id)}}>delete</button> this student?
                                                                    </Popover.Body>
                                                                </Popover>
                                                            }>
                                                                <Button variant="outline-danger" style={{marginLeft: "16pt"}}>
                                                                    Delete <i className="bi bi-trash"/>
                                                                </Button>
                                                            </OverlayTrigger>
                                                        </td>
                                                    </tr>);
                                            })}
                                            <tr><td colSpan="100%">
                                                <Button variant="outline-secondary" style={{marginLeft:"16pt"}} onClick={()=>{
                                                    this.setState({showModal: true, creating: false, selectedGroup: id});
                                                }}>
                                                    Add existing Students <i className="bi bi-people"/>
                                                </Button>
                                                <Button variant="outline-success" style={{marginLeft: "16pt"}} onClick={()=>{
                                                    this.setState({showModal: true, creating: true, createType: "Student", selectedGroup: id});
                                                }}>
                                                    Create a new Student <i className="bi bi-person-plus"/>
                                                </Button>
                                                <OverlayTrigger
                                                trigger="click"
                                                placement="right"
                                                overlay={
                                                    <Popover>
                                                        <Popover.Header>Confirmation</Popover.Header>
                                                        <Popover.Body>
                                                            Are you sure you want to <button style={{color:"#f00", border:"none", backgroundColor: "#fff", padding: 0}} href="" onClick={(e)=>{e.preventDefault();this.props.deleteGroup(group._id, this.props.currentUser._id)}}>delete</button> this student?
                                                        </Popover.Body>
                                                    </Popover>
                                                }>
                                                    <Button variant="outline-danger" style={{marginLeft: "16pt"}}>
                                                        Delete this group <i className="bi bi-trash"/>
                                                    </Button>
                                                </OverlayTrigger>
                                            </td></tr></tbody>
                                            </>
                                        )}
                                    </Table>
                                    </Accordion.Body>
                                </Accordion.Item>
                            )
                        })
                    }
                </Accordion>
                <Button variant="outline-primary" style={{marginLeft: "16pt", marginTop: "-104pt"}} onClick={()=>{
                    this.setState({showModal: true, creating: true, createType: "Group"});
                }}>
                    Create a new Group <i className="bi bi-plus-circle"/>
                </Button>
                </>
            )

        } else {
            return (
                <Table striped border="true" style={{fontSize: "16pt", marginTop: "16pt"}}>
                    <tbody>
                        <tr>
                            <td>You do not have any groups.
                                <Button variant="outline-success" style={{marginLeft: "16pt"}} onClick={()=>{
                                    this.setState({showModal: true, creating: true, createType: "Group"});
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

    renderStudentSelect(){
        return this.props.students.map((student, i)=>{
            let color = student._id.substring(student._id.length-6,student._id.length);
            let group = this.props.groups[this.state.selectedGroup];
            return (
                <ColoredButton key={i} color={color} style={{margin: "8px", wordWrap:"break-word", width:"144px", height:"144px"}}
                active={group.students.map(student=>{return student._id}).indexOf(student._id) !== -1}
                onClick={()=>{
                    let changedStudents = group.userIDs;
                    if(group.students.map((groupStudent)=>{return groupStudent._id}).indexOf(student._id)===-1){
                        changedStudents.push(student._id);
                    } else {
                        changedStudents.splice(changedStudents.indexOf(student._id), 1);
                    }
                    this.props.updateGroupStudents(group._id, changedStudents, this.props.currentUser._id)
                }}>
                <div style={{
                    display: "flex",
                    margin: "4px",
                    alignItems:"flex-start",
                    flexDirection:"column",
                    textAlign: "center"
                }}>
                    <span style={{
                        background: "#"+color,
                        color: "#fff",
                        borderRadius: "50%",
                        height: "48pt",
                        width: "48pt",
                        fontSize: "32pt",
                        textAlign: "center",
                        margin:"auto",
                        border:"1px solid #fff"
                    }}>
                        {student.name.charAt(0)}
                    </span>
                    <div style={{textAlign:"center", width:"100%"}}>
                        {student.name}
                    </div>
                </div>
                </ColoredButton>
            )
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
                additionalDropDownItems = {
                    <NavigateLink to="/chat">
                        <Dropdown.Item>
                            <i className="bi bi-chat"/> Chat
                        </Dropdown.Item>
                    </NavigateLink>
                }
                errorMessage = {this.props.errorMessage}
                setErrorMessage = {this.props.setErrorMessage}
                loginHandler = {this.props.loginHandler}
                updateUserName = {this.props.updateUserName}
            >
                <Row style={{justifyContent: "center", width: "100%", fontSize: "80pt"}}>
                    <Col/>
                    <Col>
                        {this.renderGroups()}
                    </Col>
                    <Col/>
                </Row>
                <ModalTemplate
                    size='lg'
                    title={
                        this.state.creating
                        ? "Create a new " + this.state.createType
                        : "Select the students to add"
                    }
                    show={this.state.showModal}
                    hide={()=>{this.setState({showModal: false})}}
                    handleSubmit={
                        this.state.creating
                        ? this.handleCreateSubmit.bind(this)
                        : ()=>{this.setState({showModal: false})}
                    }
                >
                    {this.state.creating
                    ? (<Form>
                            <Form.Group>
                                <Form.Label>{this.state.createType} Name</Form.Label>
                                <Form.Control placeholder={this.state.createType+"Name"} onChange={(e)=>{this.handleNameChange(e)}}/>
                                    <Form.Label style={{color:"#f44"}}>{this.props.errorMessage}</Form.Label>
                                </Form.Group>
                        </Form>)
                    : (
                        <div style={{
                            display: "flex",
                            flexFlow: "row wrap",
                            width:"fit-content"
                        }}>
                            {this.renderStudentSelect()}
                        </div>
                    )
                    }
                </ModalTemplate>
            </TemplatePage>
        )
    }
}

export default GroupsPage;
