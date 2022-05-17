import React from 'react';
import { Hover, HoverStyle, SlackCounterGroup} from '@charkour/react-reactions/';
import SlackCSS from "./SlackCSS.js";

export const defaultProps= {
    style: {},
    reactions: {
        "🚫": ["error loading reactions"]
    },
    user: '',
    onSelect: (emoji) => {
        console.log(emoji);
    },
    onAdd: () => {
        console.log('add');
    },
    side: "right"
};

const counterStyle = {
    display: 'flex',
};
const addStyle = {
    cursor: 'pointer',
    fontFamily: 'Slack',
    padding: '0 2px',
    opacity: '1',
    transition: 'opacity 0.1s ease-in-out',
};
const groupStyle = {
    margin: '0 1px',
};
const addStyleHover = {
    opacity: '1',
};

export const SlackCounter = ({
    style = defaultProps.style,
    reactions = defaultProps.reactions,
    user = defaultProps.user,
    onSelect = defaultProps.onSelect,
    onAdd = defaultProps.onAdd,
    side = defaultProps.side,
}) => {
    const components = [
        (<HoverStyle hoverStyle={addStyleHover} style={addStyle} onClick={onAdd} key={0}>
            <SlackCounterGroup emoji={''} />
        </HoverStyle>),
        (Object.entries(reactions).map(([emoji, rawNames], i) => {
            if(rawNames.length === 0 ){return null;}
            const names = rawNames.map((name) => {
                return name === user ? "You" : name;
            });
            return (
                <div style={groupStyle} key={emoji}>
                    <SlackCounterGroup
                    emoji={emoji}
                    count={names.length}
                    names={names}
                    active={names.includes(user)}
                    onSelect={onSelect}
                    />
                </div>
            );
        }))
    ]
    if(side === "left"){
        return (
            <>
                <SlackCSS/>
                <Hover style={Object.assign({}, counterStyle, style)}>
                    {components}
                </Hover>
            </>
        );
    } else {
        return (
            <>
                <SlackCSS/>
                <Hover style={Object.assign({}, counterStyle, style)}>
                    {[components[1], components[0]]}
                </Hover>
            </>
        );
    }
};


export default SlackCounter;
