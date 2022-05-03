import React, { Component } from "react";

const infoStyle = {

}

const messageStyle = {
    width: "fit-content",
    height: "fit-content",
    textAlign: "left",
    padding: "4pt 12pt",
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
        var message = this.props.message;
        if(message.user === "server"){
            return(
                <div style = {infoStyle}>
                    {message.text}
                </div>
            )
        }
        switch(message.type){
            case "image":
                return (
                    <div style={Object.assign({}, messageStyle, this.props.wasSentByCurrentUser ? toStyle : fromStyle)}>
                        <img  alt=""  src = {message.text}/>
                    </div>
                )
            case "link":
                return (
                    <div style={Object.assign({}, messageStyle, this.props.wasSentByCurrentUser ? toStyle : fromStyle)}>
                        <a style={{color: "#fff"}} rel="noreferrer" target="_blank" href= {message.text}>{message.text}</a>
                    </div>
                )
            default:
                return (
                    <div style={Object.assign({}, messageStyle, this.props.wasSentByCurrentUser ? toStyle : fromStyle)}>
                        {message.user}: {message.text}
                    </div>
                )
        }
    }
}

export default Message;
