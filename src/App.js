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

    getNeighbours(board, queue, node) {
        let neighbours = [
            {"y": node.y - 1, "x": node.x},
            {"y": node.y + 1, "x": node.x},
            {"y": node.y, "x": node.x - 1},
            {"y": node.y, "x": node.x + 1}]
        let visited = JSON.stringify(this.visited)
        for(const neighbour of neighbours) {
            if (0 <= neighbour.y && neighbour.y < this.boardWidth && 0 <= neighbour.x && neighbour.x < this.boardHeight
                && visited.indexOf(JSON.stringify([neighbour.x, neighbour.y])) === -1) {
                let neighbourNode = board[neighbour.y][neighbour.x]
                if (node.path + 1 < neighbourNode.path) {
                        neighbourNode.path = node.path + 1
                        neighbourNode.previous = node
                }
                queue.push(board[neighbour.y][neighbour.x])
            }
        }
        return queue
    }

    traversalAlgorithm(board, xIndex, yIndex) {
        let queue = []
        let firstNode = board[this.state.y][this.state.x]
        firstNode.path = 0
        queue = this.getNeighbours(board, queue, firstNode)
        while (queue.length !== 0) {
            let node = queue.shift()
            this.visited.push([node.x, node.y])
            if(board[node.y][node.x].image === "") {
                queue = this.getNeighbours(board, queue, node)
            }
        }
        return board[yIndex][xIndex].previous !== null
    }

    findPath(xIndex, yIndex) {
        let board = this.state.board
        this.visited = []
        for (let y = 0; y < this.boardWidth; y++) {
            for (let x = 0; x < this.boardHeight; x++) {
                board[y][x].path = Number.MAX_VALUE
                board[y][x].x = x
                board[y][x].y = y
                board[y][x].previous = null
            }
        }
        return this.traversalAlgorithm(board, xIndex, yIndex)
    }

    backtrackPath(xIndex, yIndex) {
        let path = []
        let node = this.state.board[yIndex][xIndex]
        while(node) {
            path.push(node)
            node = node.previous
        }
        return path
    }

    checkForTurns(path) {
        let turns = 0
        for(const node of path) {
            let turningPoint = node.previous
            if(turningPoint.previous === null) {
                break
            }
            else if(Math.abs(node.x - turningPoint.x) !== Math.abs(turningPoint.x - turningPoint.previous.x)) {
                turns += 1
            }
            else if(Math.abs(node.y - turningPoint.y) !== Math.abs(turningPoint.y - turningPoint.previous.y)) {
                turns += 1
            }
        }
        return turns <= 2
    }

    colorPath(board, path) {
        path.forEach((node) => {node.colored = true})
        setTimeout(() => {
            path.forEach((node) => {node.colored = undefined})
            this.setState({board: board})
        }, 1000)
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
        if (!this.checkForTurns(path)) {
            return false
        }
        this.colorPath(this.state.board, path)
        return true
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
        else if(this.state.x !== null && (this.state.x !== xIndex || this.state.y !== yIndex) && this.state.y !== null) {
            let pathExists = this.checkPath(xIndex, yIndex)
            if(pathExists) {
                this.setBlank(this.state.x, this.state.y)
                this.setBlank(xIndex, yIndex)
            }
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
