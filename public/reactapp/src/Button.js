import React from 'react';
import './App.css';

export default class Button extends React.Component {
    render(){
        const { onClick, text, disabled } = this.props;
        return(
        <div>
            <button disabled={disabled} className='select-but' onClick={onClick}>
                {text}
            </button>
        </div>
        );
    }
}