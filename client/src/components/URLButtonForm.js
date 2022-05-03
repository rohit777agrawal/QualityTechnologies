import React, { Component } from "react";
import { OverlayTrigger, Form, FormControl, InputGroup, Button, Popover } from "react-bootstrap";

class URLButtonForm extends Component{
    render(){
        return (
            <OverlayTrigger trigger="click" show={this.props.show} onToggle={()=>{this.props.toggle()}} placement="top" overlay = {
                <Popover id="popover-imageURL">
                    <Popover.Header as="h3">{this.props.type.charAt(0).toUpperCase() + this.props.type.slice(1)} url</Popover.Header>
                    <Popover.Body>
                    <Form>
                        <InputGroup className="mb-3">
                        <FormControl
                            placeholder="type a url"
                            aria-label="message box"
                            aria-describedby="basic-addon2"
                            id="draftURL"
                            value={this.props.url}
                            onChange={this.props.handleURLInput}
                            />
                            <Button variant="outline-secondary" id="button-addon2" onClick={()=>{this.props.send(this.props.type)}}>
                            Send
                            </Button>
                        </InputGroup>
                    </Form>
                    </Popover.Body>
                </Popover>
            }>
                <Button variant="outline-secondary" id="button-addon2">
                    {this.props.children}
                </Button>
            </OverlayTrigger>
        );
    }
}

export default URLButtonForm;
