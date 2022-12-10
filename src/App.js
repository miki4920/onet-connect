import React from 'react';
import {v4 as uuidv4} from 'uuid';
import './App.css';

function randomiseArray(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

class Tile extends React.Component {
    render() {
        return(
        <button
            key={uuidv4()}
            className={"tile" + (this.props.image ? " hasTile" : " noTile") + (this.props.colored ? " colored" : "")}
            id={this.props.clicked ? "clicked" : undefined}
            style={{
                backgroundImage: `url("icons/${this.props.image}.png")`,
                backgroundSize: "cover"
            }}
            onClick={this.props.onClick}>
        </button>)
    }
}

class Board extends React.Component {
    randomiseTiles(tileQueue) {
        while (tileQueue.length > 0) {
            let icon = this.icons[(tileQueue.length / 2) % (this.icons.length)]
            for (let i = 0; i < 2; i++) {
                tileQueue.pop().image = icon
            }
        }
    }

    createBoard() {
        let board = []
        let queue = []
        for (let y = 0; y < this.boardWidth; y++) {
            let row = []
            for (let x = 0; x < this.boardHeight; x++) {
                let tile = {"image": ""}
                row.push(tile)
                if (!(x === 0 || y === 0 || x === this.boardHeight - 1 || y === this.boardWidth - 1)) {
                    queue.push(tile)
                }
            }
            board.push(row)
        }
        queue = randomiseArray(queue)
        this.randomiseTiles(queue)
        return board
    }

    constructor(props) {
        super(props);
        this.boardHeight = 8;
        this.boardWidth = 14;
        this.icons = ["animal_skull", "arrow", "bone", "book", "boot", "brain", "crown", "doll", "eyes", "gloves",
            "heart", "helmet", "key", "knife", "letter", "papyrus", "potion", "purse", "scroll", "skull", "stake",
            "tooth"]
        this.state = {
            board: this.createBoard(),
            x: null,
            y: null
        }
        this.visited = []
    }



    findPath(xIndex, yIndex) {
        let board = this.state.board
        this.visited = []
        for (let y = 0; y < this.boardWidth; y++) {
            for (let x = 0; x < this.boardHeight; x++) {
                board[y][x].path = Number.MAX_VALUE
                board[y][x].x = x
                board[y][x].y = y
                board[y][x].turns = Number.MAX_VALUE
                board[y][x].previous = null
            }
        }
        return this.traversalAlgorithm(board, xIndex, yIndex)
    }



    checkPath(xIndex, yIndex) {
        if (this.state.board[this.state.y][this.state.x].image !== this.state.board[yIndex][xIndex].image) {
            return false;
        }
        let pathExists = this.findPath(xIndex, yIndex)
        if(!pathExists) {
            return false
        }
        let path = this.backtrackPath(xIndex, yIndex)
        this.colorPath(this.state.board, path)
        return pathExists
    }

    setBlank(xIndex, yIndex) {
        let board = this.state.board
        board[yIndex][xIndex].image = ""
        this.setState({board: board})
    }

    clickTile(xIndex, yIndex) {
        if(this.state.x === null && this.state.y === null && this.state.board[yIndex][xIndex].image !== "") {
            this.setState({x: xIndex, y: yIndex})
        }
        else if(this.state.x !== null && (this.state.x !== xIndex || this.state.y !== yIndex) && this.state.y !== null && this.checkPath(xIndex, yIndex)) {
            this.setBlank(this.state.x, this.state.y)
            this.setBlank(xIndex, yIndex)
            this.setState({x: null, y: null})
        }
        else {
            this.setState({x: null, y: null})
        }
    }

    render() {
        return (
            <main>
                {this.state.board.map((row, yIndex) => (
                    <div key={uuidv4()} className="row">
                        {row.map((tile, xIndex) =>
                            (
                                <Tile key={uuidv4()}
                                      image={tile.image}
                                      clicked={xIndex === this.state.x && yIndex === this.state.y}
                                      onClick={() => this.clickTile(xIndex, yIndex)}
                                      colored={tile.colored}
                                />
                            )
                        )}

                    </div>
                ))}
            </main>
        )
    }

}

class App extends React.Component {
    render() {
        return <Board/>
    }
}

export default App;
