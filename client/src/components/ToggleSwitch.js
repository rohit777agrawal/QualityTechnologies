import React from "react";

export const defaultProps = {
    children: null,
    name: "ToggleSwitch",
    show: true,
    disabled: false,
    toggled: false,
    onToggle: (toggled) => {
        console.log(toggled);
    },
    style: {}
}

const defaultStyle = {
    container: {
        position: 'relative',
        display: 'inline-block',
        width: 24,
        height: 14,
        verticalAlign: 'middle',
        cursor: 'pointer',
        userSelect: 'none'
    },

    containerDisabled: {
        opacity: 0.7,
        cursor: 'not-allowed'
    },

    track: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 100,
        backgroundColor: '#cccccc'
    },

    trackChecked: {
        backgroundColor: '#5e72e4'
    },

    button: {
        position: 'absolute',
        top: 2,
        bottom: 2,
        right: "52%",
        left: 2,
        width: "44%",
        backgroundColor: '#fff',
        borderRadius: 100,
        transition: 'all 100ms ease'
    },

    buttonChecked: {
        right: 2,
        left: "52%"
    }
};

export const ToggleSwitch = ({
        children = defaultProps.children,
        name = defaultProps.name,
        show = defaultProps.show,
        disabled = defaultProps.disabled,
        toggled = defaultProps.toggled,
        onToggle = defaultProps.onToggle,
        style = defaultProps.style,
        ...props
}) => {
    Object.keys(defaultStyle).forEach((key) => {
        style[key] = Object.assign({}, defaultStyle[key], style[key])
    });
    return(
        <div hidden={!show}>
            {children}
            <label
                {...props}
                style = {Object.assign({}, style.container, disabled ? style.containerDisabled : {} )}
                onClick={() => {if(!disabled){onToggle()}}}
            >
                <input type="hidden" name={name} value={toggled}/>
                <span style={Object.assign({}, style.track, toggled ? style.trackChecked : {})}/>
                <span style={Object.assign({}, style.button, toggled ? style.buttonChecked : {})}/>
            </label>
        </div>
    )
}
export default ToggleSwitch;
