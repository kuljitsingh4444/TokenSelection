import React from 'react';
import Button from './Button';
import Text from './Text';
import './App.css';

export default class App extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      tokens : [],
      selectionMode : false,
      multipleTokenAllowed : false
    }
  }

  componentDidMount() {
    this.getTokens();
  }

  getTokens = () => {
    //get call after update
    fetch('http://localhost:8000/getTokens/')
    .then(res => { return res.json() })
    .then(data => {
      this.setState({
        tokens : data.tokens
      })
      if(data.tokens.length > 1){
        this.setState({
          multipleTokenAllowed : true
        })
      }
    })
  }

  updatedTokens = (tokens) => {
    fetch('http://localhost:8000/updateTokens/',{
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(tokens)
    })
    .then(res => { return res.json() })
    .then(data => {
    })
  }

  getHeadIndex = (firstLetterIndex, lastLetterIndex,text) => {
    let headIndex = 0;
    if(text[firstLetterIndex] === ' ') {
      for( let l = firstLetterIndex ; l < lastLetterIndex ; l++ ) {
        if(text[l] !== ' '){
          headIndex = l;
          break;
        }
      }
    } else {
      for( let k = firstLetterIndex ; k > -1 ; k-- ) {
        if(text[k] === ' ') {
          headIndex = k+1;
          break;
        }
      }
    }
    return headIndex;
  }

  getTailIndex = (headIndex, text) => {
    let tailIndex = text.length-1;
    for(let i = headIndex ; i < String(text).length+1 ; i++) {
      if(text[i] && text[i].trim() === '') {
        tailIndex = i-1;
        break;
      }
    }
    return tailIndex;
  }

  handleSelction = () => {
    const highlightedText = window.getSelection().toString();
    if(highlightedText && highlightedText.trim()) {
      let token = '';
      const selection = window.getSelection();
      const text = selection.anchorNode.data;
      const anchorOffset = selection.anchorOffset;
      const extentOffset = selection.extentOffset;
      let firstLetterIndex = 0, lastLetterIndex = 0;

      if(Number(anchorOffset) > Number(extentOffset)) {
        firstLetterIndex = extentOffset;
        lastLetterIndex = anchorOffset;
      } else {
        lastLetterIndex = extentOffset;
        firstLetterIndex = anchorOffset;
      }

      const headIndex = this.getHeadIndex(firstLetterIndex, lastLetterIndex, text);
      const tailIndex = this.getTailIndex(headIndex, text);
      for (let l = headIndex ; l <= tailIndex; l++ ) {
        token+=text[l];
      }
      this.validateToken(token,headIndex,tailIndex)
    } else {
      alert('No Text Highlighted!')
    }
  }

  checkTokenForInvalidCharacters = (token,tailIndex) => {
    if(token[token.length-1] === '.' || token[token.length-1] === ',') {
      tailIndex = tailIndex - 1;
      token = token.substr(0,token.length-1);
      return this.checkTokenForInvalidCharacters(token, tailIndex);
    } else {
      return { token, tailIndex };
    }
  }

  validateToken = (token, headIndex, tailIndex) => {
    const { tokens, multipleTokenAllowed } = this.state;
    let updatedTokens = [];
    if(multipleTokenAllowed){
      updatedTokens = [...tokens];
    }
    let newToken = this.checkTokenForInvalidCharacters(token,tailIndex);
    token = newToken.token;
    tailIndex = newToken.tailIndex;
    console.log(token);
    if(token.trim() === ''){
      alert('not a valid selection!');
      return;
    }
    if(token.includes(',') || token.includes('.')) {
      alert(`${token} contains ',' or '.' !`);
      return;
    }
    let tokenKey = headIndex;
    let isDuplicate = false;
    let tag = 'Kola';
    tokens.forEach((token,index) => {
      if(token.key === tokenKey){
        isDuplicate = true;
      }
    })
    if(isDuplicate){
      updatedTokens = updatedTokens.filter(element =>{
        return element.key !== tokenKey
      })
    } else {
      //attach tag
      if(/[aeiouAEIOU]/.test(token[0])) {
        tag = 'Baky';
      }
      updatedTokens.push({ 
        value : token,
        headIndex : headIndex,
        tailIndex : tailIndex,
        key : tokenKey,
        tag : tag
      });
    }
    this.setState({
      tokens : updatedTokens
    })
    this.updatedTokens(updatedTokens)
    this.switchMode();
  }

  switchMode = () => {
    this.setState({
      selectionMode : !this.state.selectionMode
    })
  }

  unSelect = () => {
    this.updatedTokens([]);
    this.setState({
      selectionMode : false,
      tokens : []
    })
  }

  multipleSwitch = () => {
    let { multipleTokenAllowed } = this.state;
    if(multipleTokenAllowed){
      this.setState({
        tokens : []
      })
      this.updatedTokens([]);
      alert('Removed all selected tokens if any!');
    }
    if(!multipleTokenAllowed) {
      this.setState({
        selectionMode : true
      })
    }
    this.setState({
      multipleTokenAllowed : !this.state.multipleTokenAllowed,
    })
  }

  render(){
    const { tokens, selectionMode, multipleTokenAllowed } = this.state;
    return(
      <div>
        <Text selectionMode={selectionMode} tokens={tokens}/>
        <div className='butt_container disable-select'>
          <Button disabled={!selectionMode} text='Add/Delete Token' onClick={this.handleSelction}/>
          <Button text={selectionMode ? 'Disabled Selection Mode' : 'Enable Selection Mode'} onClick={this.switchMode}/>
          <Button text={'Unselect All Tokens'} onClick={this.unSelect}/>
          <Button text={multipleTokenAllowed ? 'Disabled Multiple Tokens' : 'Enable Multiple Tokens'} onClick={this.multipleSwitch}/>
        </div>
        <div className='disable-select instructions'>
          <div> Note : 1. Select the same tag agian to unselect it. </div>
          <div> Note : 2. Baky tag are colored green </div>
          <div> Note : 3. Kola tag are colored red </div>
        </div>
      </div>
    );
  }
}