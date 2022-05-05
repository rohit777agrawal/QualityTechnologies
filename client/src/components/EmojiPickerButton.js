import React, { Component } from "react";
import Picker from "emoji-picker-react";

const EmojiPicker = () => {
    const[chosenEmoji, setChosenEmoji] = useState(null);

    const onEmojiClick = (event, emojiObject) => {
        setChosenEmoji(emojiObject);
    };

    return(
        <>
            <Picker onEmojiClick={onEmojiClick}/>
        </>
    )
}
default export EmojiPicker;
