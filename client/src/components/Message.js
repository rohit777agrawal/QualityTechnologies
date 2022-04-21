import React, { Component } from "react";

const messageStyle = {
    width: "fit-content",
    height: "fit-content",
    textAlign: "left",
    padding: "8pt 12pt 0 12pt",
    marginBottom: "4pt"
}

const toStyle = {
    backgroundColor: "#55f",
    color: "#fff",
    alignSelf: "flex-end",
    borderRadius: "16pt 16pt 0 16pt"
}

const fromStyle = {
    backgroundColor: "#ccc",
    color: "#000",
    alignSelf: "flex-start",
    borderRadius: "16pt 16pt 16pt 0"
}

class Message extends Component{
    render() {
        return (
            <div style={Object.assign({}, messageStyle, this.props.wasSent ? toStyle : fromStyle)}>
                {this.props.children}
            </div>
            )
    }
}

export default Message;
