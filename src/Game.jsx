import React from 'react'
import Board from './Board'
import io from 'socket.io-client';
class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            socket: io.connect('http://localhost:5000', {'reconnection': false}),
            squares: Array(9).fill(null),
            symbol: null,
            myTurn: null,
            opponentConnected: null,
        };

        let bind = this;
        this.state.socket.on('game.begin', function(data) {
            let symbol = data.symbol;

            let myTurn = (symbol === 'X');

            bind.setState({
                squares: Array(9).fill(null),
                symbol: symbol,
                myTurn: myTurn,
                opponentConnected: true,
            });
        })

        this.state.socket.on('move.made', function(data) {
            
            bind.setState({
                squares: data.squares,
                myTurn: (data.symbol !== bind.state.symbol),
            })
        })

        this.state.socket.on('opponent.left', function() {
            bind.setState({
                opponentConnected: false,
            })
        })

        this.state.socket.on('connect_error', function() {
            bind.setState({
                serverStatus: "OFFLINE",
            })
        })
    }

    handleClick(i) {
        const squares = this.state.squares.slice();
        if(this.calculateWinner(squares) || squares[i] || this.state.myTurn === false) {
            return;
        }
        squares[i] = this.state.symbol;
        this.state.socket.emit('make.move', {
            squares: squares,
            symbol: this.state.symbol,
        });
        // this.setState({
        //     squares: squares,
        // })
    }

    calculateWinner(squares) {
        const lines = [
          [0, 1, 2],
          [3, 4, 5],
          [6, 7, 8],
          [0, 3, 6],
          [1, 4, 7],
          [2, 5, 8],
          [0, 4, 8],
          [2, 4, 6], 
        ];
    
        for(let i = 0; i < lines.length; i++) {
          const [a, b, c] = lines[i];
          if(squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
          }
        }
    
        return null;
      }

    isBoardFilled() {
        const squares = this.state.squares.slice();
        for(let i = 0; i < squares.length; i++) {
            if(squares[i] === null) {
                return false;
            }
        }
        return true;
    }

    render() {
        const winner = this.calculateWinner(this.state.squares);
        let status;
        if(this.state.myTurn === null) {
            status = 'Waiting for another player to connect';
        }
        else if(this.state.myTurn) {
            status = 'It is your turn!';
        }
        else if(!this.state.myTurn) {
            status = 'Please wait for your turn...';
        }

        if(winner) {
            status = 'Player ' + winner + ' is the winner';
        }
        else if(this.isBoardFilled()) {
            status = 'A tie has occured!';
        }
        else if(this.state.opponentConnected === false) {
            status = 'Opponent disconnected. You automically win!';
        }
        
        return (
            <div style={{textAlign: 'center'}}>
                <Board squares={this.state.squares} onClick={(i) => this.handleClick(i)}/>
                <span>{status}</span><br/>
                <span>Your symbol is: {this.state.symbol}</span>
            </div>
        )
    }
}

export default Game;