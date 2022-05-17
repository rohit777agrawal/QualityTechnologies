import React from "react";
import { Modal, Button } from "react-bootstrap";

const defaultProps = {
    title: "title",
    show: true,
    hide: ()=>{
        console.log("hiding")
    },
    handleSubmit: (event)=>{
        event.preventDefault();
        console.log(event);
    },
    children: (<></>),
}

const StudentsModal = ({
    title = defaultProps.title,
    show = defaultProps.show,
    hide = defaultProps.hide,
    handleSubmit = defaultProps.handleSubmit,
    children = defaultProps.children,
    ...props
}) => {
    return (
        <Modal show={show} onHide={()=>{hide()}} {...props}>
            <Modal.Header closeButton>
                <Modal.Title style={{textAlign: "center"}}>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {children}
                <div style={{display:"flex", justifyContent:"space-evenly"}}>
                <Button variant="secondary" onClick={()=>{hide()}}>
                Close
                </Button>
                <Button variant="primary" type="submit" onClick={(e)=>{
                    e.preventDefault();
                    handleSubmit(e);
                }}>
                    Save
                </Button>
                </div>
            </Modal.Body>
        </Modal>
    )
}

export default StudentsModal;
