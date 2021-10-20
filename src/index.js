import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
const BOARD_SIZE = 5

function Square(props) {
  return (
    <button className={props.className + " square"} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i, isHighlight) {
    return (
      <Square
        className={isHighlight ? "highlight" : ""}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    let boardItems = []
    
    let renderRow = rowI => {
      let rowItems = []
      for (let colI = 0; colI < BOARD_SIZE; ++colI) {
        let index = rowI * BOARD_SIZE + colI
        let isHighlight = this.props.highlightItems ? this.props.highlightItems.includes(index) : false
        rowItems.push(this.renderSquare(index, isHighlight))
      }
      return (<div className="board-row">{rowItems}</div>)
    }
    
    for(let i = 0; i < BOARD_SIZE; ++i)
      boardItems.push(renderRow(i))
    
    return (
      <div className="center">
        {/* <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div> */}
        {boardItems}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(Math.pow(BOARD_SIZE, 2) + 1).fill(null),
          location: null
        }
      ],
      stepNumber: 0,
      xIsNext: true,
      reverseMoveList: false,
      winnerCase: null,
      highlightItems: []
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    let calcWinnerResult = calculateWinner(squares, current.location, this.state.stepNumber)
   
    // console.log(Math.floor(i / BOARD_SIZE), i % BOARD_SIZE)
    let moveLocation = {
      row: Math.floor(i / BOARD_SIZE),
      col: i % BOARD_SIZE,
      index: i
    }

    if (squares[i] || calcWinnerResult) {
      return
    }

    squares[i] = this.state.xIsNext ? "X" : "O";

    calcWinnerResult = calculateWinner(squares, moveLocation, this.state.stepNumber + 1)

    this.setState({
      ...this.state,
      history: history.concat([
        {
          squares: squares,
          location: moveLocation
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      highlightItems: calcWinnerResult ? calcWinnerResult.winSquares : []
    });
  }

  jumpTo(step) {
    const history = this.state.history.slice(0, step + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    let calcWinnerResult = calculateWinner(squares, current.location, step)
    this.setState({...this.state,
      stepNumber: step,
      xIsNext: (step % 2) === 0,
      highlightItems: calcWinnerResult ? calcWinnerResult.winSquares : []
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    let winner = calculateWinner(current.squares, current.location, this.state.stepNumber);
    winner = winner ? winner.value : winner
    const moves = history.map((step, move) => {
      const desc = move ?
        `Go to move #${move} at (${step.location.col}, ${step.location.row})`:
        'Go to game start';
      let className = move == this.state.stepNumber ? 'selected-item' : ''
      return (
        <li className={className} key={move}>
          <button className={className} onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });
    if (this.state.reverseMoveList) moves.reverse()
    let status;

    if (winner && winner !== 'draw') {
      status = "Winner: " + winner;
    }
    else if (winner === 'draw') {
      status = 'Match End: Draw'
      alert(status)
    }
    else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            highlightItems = {this.state.highlightItems}
            squares={current.squares}
            onClick={i => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <br/>
          <div>
            <ol>{moves}</ol>
            <button onClick={()=>{this.setState({...this.state, reverseMoveList: !this.state.reverseMoveList})}}>Reverse List Order</button>
          </div>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares, location, stepNumber) {
  if (!location) return undefined

  if (stepNumber === Math.pow(BOARD_SIZE, 2)) {
    return {value: 'draw', winCase: null}
  }

  let currentSquare = squares[location.row * BOARD_SIZE + location.col]

  let copy = [...squares]
  let board = []
  while(copy.length) board.push(copy.splice(0, BOARD_SIZE))

  let rowSquares = []
  let colSquares = []
  let diagSquares = []
  let antiSquares = []

  let locationToIndex = (row, col) => row * BOARD_SIZE + col
  for(let i = 0; i < BOARD_SIZE; ++i) {
    if (board[location.row][i] === currentSquare) rowSquares.push(locationToIndex(location.row, i))
    if (board[i][location.col] === currentSquare) colSquares.push(locationToIndex(i, location.col))
    if (board[i][i] === currentSquare) diagSquares.push(locationToIndex(i, i))
    if (board[BOARD_SIZE - i - 1][i] === currentSquare) antiSquares.push(locationToIndex(BOARD_SIZE - i - 1, i))
  }

  let winSquare = null
  let winSquares = null

  if (rowSquares.length === BOARD_SIZE) {
    winSquare = currentSquare
    winSquares = rowSquares
  }
  else if (colSquares.length === BOARD_SIZE) {
    winSquare = currentSquare
    winSquares = colSquares
  }
  else if (diagSquares.length === BOARD_SIZE) {
    winSquare = currentSquare
    winSquares = diagSquares
  }
  else if (antiSquares.length === BOARD_SIZE) {
    winSquare = currentSquare
    winSquares = antiSquares
  }
  if (winSquare) return {value: winSquare, winSquares: winSquares}
}

