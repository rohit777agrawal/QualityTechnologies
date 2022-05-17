import React, { Component } from "react";
import { SlackCounter } from "./CustomSlackCounter.js"
import Picker from "emoji-picker-react";

const mainDiv = {
    display: "flex",
    flexDirection: "column",
    height: "fit-content",
}

const messageStyle = {
    width: "fit-content",
    height: "fit-content",
    textAlign: "left",
    padding: "4pt 12pt",
    marginBottom: "4pt"
}

const blueChatBubble = {
    alignSelf:"flex-end",
    backgroundColor: "#55f",
    color: "#fff",
    borderRadius: "16pt 16pt 0 16pt"}

const greyChatBubble = {
    alignSelf: "flex-start",
    backgroundColor: "#ccc",
    color: "#000",
    borderRadius: "16pt 16pt 16pt 0"
}

const infoStyle = {
    color: "#333",
}

const bottomLine = {
    display: "flex",
    fontSize: "10pt",
    margin: "0 4pt",
    opacity: 1,
}

class Message extends Component{
    constructor(props){
        super(props);
        this.state = {
            showSelector: false,
        }
    }

    react(emoji){
        this.props.socket.emit("messageReaction", this.props.message._id, emoji);
    }

    styleTemplate(){
        if(this.props.currentUser._id === this.props.message.senderID){
            return {
                mainDiv: Object.assign({}, {float: "right"}, mainDiv),
                chatBubble: Object.assign({}, messageStyle, blueChatBubble, this.props.message.type === "image" ? {maxWidth:"30%", maxHeight:"30%"}: {}),
                bottomLine: Object.assign({}, infoStyle, bottomLine, {alignSelf: "flex-end",}),
                slackCounter: {marginRight: "8px"},
                selectorParentDiv: {height: 0, width:"100%", alignSelf: "flex-end"},
                selectorDiv: {position:"absolute", right: "0px"},
                side: "right"
            }
        } else {
            return {
                mainDiv: Object.assign({}, {float: "left"}, mainDiv),
                chatBubble: Object.assign({}, messageStyle, greyChatBubble, this.props.message.type === "image" ? {maxWidth:"30%", maxHeight:"30%"}: {}),
                bottomLine: Object.assign({}, infoStyle, bottomLine, {alignSelf: "flex-start",}),
                slackCounter: {marginLeft: "8px"},
                selectorParentDiv: {height: 0, width: "100%", alignSelf: "flex-start"},
                selectorDiv: {position:"absolute"},
                side: "left",
            }
        }
    }

    messageTemplate(contents) {
        const style = this.styleTemplate();
        const defaultBottomLineProps = {
            style: {},
            parent: {}
        }
        if(this.props.message.deleted){
            style.chatBubble = {...style.chatBubble, backgroundColor: "#f00"}
        }
        const BottomLine = ({
            style = defaultBottomLineProps.style,
            parent = defaultBottomLineProps.parent
        }) => {
            let components = [
                <SlackCounter
                    style={style.slackCounter}
                    reactions = {parent.props.message.reactions}
                    user={parent.props.currentUser.name}
                    onSelect={(emoji)=>{this.react(emoji)}}
                    onAdd={()=>{this.setState({showSelector: !this.state.showSelector});}}
                    side={style.side}
                    key = {0}
                />,
                <span key={1}>{parent.props.message.senderName}</span>
            ]
            if(this.props.currentUser.isTeacher){
                components.push(
                    <button key={2} style={{color:"#f00", border:"none", backgroundColor: "#fff", padding: 0, marginLeft: "4pt"}} href="" onClick={(e)=>{
                        e.preventDefault();
                        console.log(this.props.message._id)
                        this.props.socket.emit("deleteMessage", this.props.message._id)
                    }}>{this.props.message.deleted ? "undelete" : "delete"}</button>
                )
                if(parent.props.currentUser._id === parent.props.message.senderID){
                    return(
                        components
                    )
                } else {
                    return(
                        [components[2], components[1], components[0]]
                    )
                }
            } else {
                if(parent.props.currentUser._id === parent.props.message.senderID){
                    return(
                        components
                    )
                } else {
                    return(
                        [components[1], components[0]]
                    )
                }
            }
        }
        return(
            <>
                <div>
                    <div style={style.mainDiv}>
                        <div style={style.chatBubble}>
                            {contents}
                        </div>
                        <div style={style.bottomLine}>
                            <BottomLine
                                style={style}
                                parent={this}
                            />
                        </div>
                    </div>
                </div>
                <div style={style.selectorParentDiv}>
                    <div style={style.selectorDiv} hidden={!this.state.showSelector}>
                    <Picker native={true} onEmojiClick={(_, emojiObject) => {
                        this.react(emojiObject.emoji);
                    }}/>
                    </div>
                </div>
            </>
        )
    }

    render() {
        const message = this.props.message;
        if(message.user === "server"){
            return(
                <div style = {infoStyle}>
                    {message.text}
                </div>
            )
        }
        if(!this.props.currentUser.isTeacher && message.deleted) return null;
        switch(message.type){
            case "image":
                return (
                    this.messageTemplate(<img style={{maxWidth: "100%", maxHeight:"100%"}} alt="" src = {message.contents}/>)
                )
            case "link":
                return (
                    this.messageTemplate(<a style={{color: "#fff"}} rel="noreferrer" target="_blank" href= {message.contents}>{message.contents}</a>)
                )
            case "server":
                //console.log("RECEIVED SERVER INFO MESSAGE", message)
                return(
                    <div style = {infoStyle}>
                        {message.contents}
                    </div>
                )
            default:
                return (
                    this.messageTemplate(
                        message.contents.split("\n").map((item, key)=>{
                            return(
                                <span key={key}>
                                    {item}
                                    <br/>
                                </span>
                            )
                        }
                    )
                )
            )
        }
    }
}

export default Message;
