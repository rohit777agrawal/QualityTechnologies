import { React, Component } from "react";
import { Container, Col, Row } from "react-bootstrap";

class Error404 extends Component {
  render(){
    return(
      <Container fluid>
      <Col/>
      <Col className="justify-content-md-center" style={{width:"100%", color: "#66c", paddingTop: "10%"}}>
        <Row style={{justifyContent: "center", width: "100%", fontSize: "80pt"}}>
          404
        </Row>
        <Row style={{justifyContent: "center", fontSize: "60pt"}}>
          Error Page
        </Row>
      </Col>
      <Col/>
      </Container>
    )
  }
}

export default Error404;
