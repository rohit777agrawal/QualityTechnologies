import React from 'react';
import { CounterObject, groupBy, Hover, HoverStyle, SlackCounterGroup} from '@charkour/react-reactions/';
import SlackCSS from "./SlackCSS.js";

export const SlackCounter = ({
  counters = defaultProps.counters,
  user = defaultProps.user,
  onSelect = defaultProps.onSelect,
  onAdd = defaultProps.onAdd,
  side = defaultProps.side,
}) => {
  const groups = groupBy(counters, 'emoji');
  if(side === "left"){
      return (
        <>
          <SlackCSS/>
          <Hover style={counterStyle}>
            <HoverStyle hoverStyle={addStyleHover} style={addStyle} onClick={onAdd}>
                <SlackCounterGroup emoji={''} />
            </HoverStyle>
            {Object.keys(groups).map((emoji) => {
              const names = groups[emoji].map(({ by }: CounterObject) => {
                return by === user ? "You" : by;
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
            })}
          </Hover>
        </>
      );
  } else {
      return (
        <>
          <SlackCSS/>
          <Hover style={counterStyle}>
            {Object.keys(groups).map((emoji) => {
              const names = groups[emoji].map(({ by }: CounterObject) => {
                return user === by ? "You": by;
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
            })}
            <HoverStyle hoverStyle={addStyleHover} style={addStyle} onClick={onAdd}>
              <SlackCounterGroup emoji={''} />
            </HoverStyle>
          </Hover>
        </>
      );
  }
};

export const defaultProps= {
  counters: [
    {
      emoji: '👍',
      by: 'Case Sandberg',
    },
    {
      emoji: '👎',
      by: 'Charlie!!!!!',
    },
  ],
  user: 'Charlie',
  onSelect: (emoji) => {
    console.log(emoji);
  },
  onAdd: () => {
    console.log('add');
  },
  sude: "right"
};

const counterStyle = {
  display: 'flex',
};
const addStyle = {
  cursor: 'pointer',
  fontFamily: 'Slack',
  paddingLeft: '8px',
  opacity: '1',
  transition: 'opacity 0.1s ease-in-out',
};
const groupStyle = {
  marginRight: '4px',
};
const addStyleHover = {
  opacity: '1',
};

export default SlackCounter;
