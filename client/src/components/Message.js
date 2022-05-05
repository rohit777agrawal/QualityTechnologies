import React, { Component } from "react";
import { SlackCounter } from "./CustomSlackCounter.js"
import Picker from "emoji-picker-react";
const isEqual = require("lodash/isEqual");
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
        let updatedReactions = this.props.message.reactions;
        let newReaction = {
            emoji: emoji,
            by: this.props.currentUser,
        }
        let indexOf = -1;
        for(let i = 0; i < updatedReactions.length; i++){
            if(isEqual(newReaction, updatedReactions[i])){
                indexOf = i;
                break;
            }
        }
        if(indexOf === -1){
            updatedReactions.push(newReaction);
        } else {
            updatedReactions.splice(indexOf,1);
        }
        let newMessage = this.props.message;
        newMessage.reactions = updatedReactions;
        this.props.socket.emit("messageUpdateToServer", newMessage);
    }

    styleTemplate(){
        if(this.props.currentUser === this.props.message.user){
            return {
                mainDiv: Object.assign({}, {float: "right"}, mainDiv),
                chatBubble: Object.assign({}, messageStyle, blueChatBubble),
                bottomLine: Object.assign({}, infoStyle, bottomLine, {alignSelf: "flex-end",}),
                slackCounter: {marginRight: "8px"},
                selectorParentDiv: {height: 0, width:"100%", alignSelf: "flex-end"},
                selectorDiv: {position:"absolute", right: "0px"},
                side: "right"
            }
        } else {
            return {
                mainDiv: Object.assign({}, {float: "left"}, mainDiv),
                chatBubble: Object.assign({}, messageStyle, greyChatBubble),
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
        const BottomLine = ({
            style = style,
            parent = this
        }) => {
            if(parent.props.currentUser === parent.props.message.user){
                return(
                    <>
                        <SlackCounter
                            style={style.slackCounter}
                            counters = {parent.props.message.reactions}
                            user={parent.props.currentUser}
                            onSelect={(emoji)=>{this.react(emoji)}}
                            onAdd={()=>{this.setState({showSelector: !this.state.showSelector});}}
                            side={style.side}
                        />
                        {parent.props.message.user}
                    </>
                )
            } else {
                return(
                    <>
                        {parent.props.message.user}
                        <SlackCounter
                            style={style.slackCounter}
                            counters = {parent.props.message.reactions}
                            user={parent.props.currentUser}
                            onSelect={(emoji)=>{this.react(emoji)}}
                            onAdd={()=>{this.setState({showSelector: !this.state.showSelector});}}
                            side={style.side}
                        />
                    </>
                )
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
                    <Picker native={true} onEmojiClick={(event, emojiObject) => {
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
        switch(message.type){
            case "image":
                return (
                    this.messageTemplate(<img  alt=""  src = {message.text}/>)
                )
            case "link":
                return (
                    this.messageTemplate(<a style={{color: "#fff"}} rel="noreferrer" target="_blank" href= {message.text}>{message.text}</a>)
                )
            default:
                return (
                    this.messageTemplate(message.text)
                )
        }
    }
}

export default Message;
