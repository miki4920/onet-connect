import React from 'react';
import {v4 as uuidv4} from 'uuid';
import './App.css';

// Shuffles Array, Fisher-Yates Shuffle
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
            // Changes whether the tile shows image, empty, or (colored for purposes of path)
            className={"tile" + (this.props.image ? " hasTile" : " noTile") + (this.props.colored ? " colored" : "")}
            id={this.props.clicked ? "clicked" : undefined}
            style={{
                backgroundImage: `url("icons/${this.props.image}.png")`,
                // This needs to be included in here, rather than in css as otherwise it is ignored
                backgroundSize: "cover"
            }}
            onClick={this.props.onClick}>
        </button>)
    }
}

class Board extends React.Component {
    // Goes through a list of all elements, and pseudo-randomly assigns images to them
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
                // Puts tile into queue for tile randomisation, but only if tile is not located on the border
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

    reshuffleTiles(queue) {
        while(queue.length !== 0) {
            let elementOne = queue.pop()
            let elementTwo = queue.pop()
            let tempImage = elementOne.image
            elementOne.image = elementTwo.image
            elementTwo.image = tempImage
        }
        this.setState({board: this.state.board})
    }

    reshuffleBoard() {
        let queue = []
        for (let y = 0; y < this.boardWidth; y++) {
            for (let x = 0; x < this.boardHeight; x++) {
                if (this.state.board[y][x].image !== "") {
                    queue.push(this.state.board[y][x])
                }
            }
        }
        queue = randomiseArray(queue)
        this.reshuffleTiles(queue)
    }

    // Given 3 nodes, turning only happens when all 3 nodes are not in the same line
    isTurning(turningPoint, node) {
        if(turningPoint.previous === null) {
            return false
        }
        else if(Math.abs(node.x - turningPoint.x) !== Math.abs(turningPoint.x - turningPoint.previous.x)) {
            return true
        }
        else if(Math.abs(node.y - turningPoint.y) !== Math.abs(turningPoint.y - turningPoint.previous.y)) {
            return true
        }
        return false
    }

    getNeighbours(board, queue, node) {
        // Create coordinates for 4 neighbours around the square
        let neighbours = [
            {"y": node.y - 1, "x": node.x},
            {"y": node.y + 1, "x": node.x},
            {"y": node.y, "x": node.x - 1},
            {"y": node.y, "x": node.x + 1}]
        let visited = JSON.stringify(this.visited)
        for(const neighbour of neighbours) {
            // Checks if the neighbour has been visited and is within the board
            if (0 <= neighbour.y && neighbour.y < this.boardWidth && 0 <= neighbour.x && neighbour.x < this.boardHeight
                && visited.indexOf(JSON.stringify([neighbour.x, neighbour.y])) === -1) {
                let neighbourNode = board[neighbour.y][neighbour.x]
                let turning = this.isTurning(node, neighbourNode)
                // Checks the shortest path with the fewest turns by treating each turn as a large distance
                if (node.path + 1 + (node.turns + turning) * (this.boardWidth + this.boardHeight) < neighbourNode.path
                    && node.turns + turning <= 2) {
                        neighbourNode.path = node.path + 1 + (node.turns + turning) * (this.boardWidth + this.boardHeight)
                        neighbourNode.previous = node
                        neighbourNode.turns = node.turns + turning
                }
                queue.push(board[neighbour.y][neighbour.x])
            }
        }
        return queue
    }

    // Dijkstra's algorithm
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

    // This function sets board parameters to ensure consistent results between searches
    async findPath(xIndex, yIndex) {
        let board = this.state.board
        this.visited = []
        for (let y = 0; y < this.boardWidth; y++) {
            for (let x = 0; x < this.boardHeight; x++) {
                board[y][x].path = Number.MAX_VALUE
                board[y][x].x = x
                board[y][x].y = y
                board[y][x].turns = 0
                board[y][x].previous = null
            }
        }
        return this.traversalAlgorithm(board, xIndex, yIndex)
    }

    // Backtracking algorithm to find the path
    async backtrackPath(xIndex, yIndex) {
        let path = []
        let node = this.state.board[yIndex][xIndex]
        while(node) {
            path.push(node)
            node = node.previous
        }
        return path
    }

    async colorPath(board, path) {
        path.forEach((node) => {node.colored = true})
        setTimeout(() => {
            path.forEach((node) => {node.colored = undefined})
            this.setState({board: board})
        }, 1000)
    }

    async checkPath(xIndex, yIndex) {
        if (this.state.board[this.state.y][this.state.x].image !== this.state.board[yIndex][xIndex].image) {
            return false;
        }
        let pathExists = await this.findPath(xIndex, yIndex)
        if(!pathExists) {
            return false
        }
        let path = await this.backtrackPath(xIndex, yIndex)
        await this.colorPath(this.state.board, path)
        return true
    }

    setBlank(xIndex, yIndex) {
        let board = this.state.board
        board[yIndex][xIndex].image = ""
        this.setState({board: board})
    }

    async clickTile(xIndex, yIndex) {
        if(this.state.x === null && this.state.y === null && this.state.board[yIndex][xIndex].image !== "") {
            this.setState({x: xIndex, y: yIndex})
        }
        else if(this.state.x !== null && (this.state.x !== xIndex || this.state.y !== yIndex) && this.state.y !== null) {
            let pathExists = await this.checkPath(xIndex, yIndex)
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
                <button id="reshuffle" onClick={() => this.reshuffleBoard()}/>
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
