import React, { Component } from "react";

const errorStyle = {
    float: "right",
    width: "fit-content",
    minWidth: "20%",
    textAlign: "left",
}

class ErrorBox extends Component{
    render() {
        return (
            <div hidden={this.props.children===""} className="alert alert-danger alert-dismissible fade show" style={errorStyle}>
                <strong>Error!</strong> {this.props.children}
            </div>
            )
    }

}

export default ErrorBox;
