import React from 'react';

export class Square extends React.Component {
    render() {
        return (
            <button className="box" onClick={() => this.props.onClick()}>
                <span>{this.props.value}</span>
            </button>
        )
    }
}

export default Square;