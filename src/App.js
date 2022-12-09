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

class Tile {
    constructor() {
        this.image = ""
    }
}

class Board extends React.Component {
    randomiseTiles(tileQueue) {
        while (tileQueue.length > 0) {
            let image = this.icons[(tileQueue.length/2) % (this.icons.length)]
            for (let i = 0; i < 2; i++) {
                tileQueue.pop().image = image
            }
        }
    }

    createBoard() {
        let board = []
        let queue = []
        for (let y = 0; y < this.boardHeight; y++) {
            let row = []
            for (let x = 0; x < this.boardWidth ; x++) {
                let tile = new Tile()
                row.push(tile)
                if (!(x === 0 || y === 0 || x === this.boardWidth-1 || y === this.boardHeight-1)) {
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
        this.boardWidth = 8;
        this.boardHeight = 14;
        this.icons = ["animal_skull", "arrow", "bone", "book", "boot", "brain", "crown", "doll", "eyes", "gloves",
            "heart", "helmet", "key", "knife", "letter", "papyrus", "potion", "purse", "scroll", "skull", "stake",
            "tooth", ""]
        this.board = this.createBoard()

    }

    render() {
        return (
            <main>
                {this.board.map((row) => (
                    <div key={uuidv4()} className="row">
                        {row.map((tile) =>
                            <button
                                key={uuidv4()}
                                className={"tile" + (tile.image ? " hasTile" : " noTile")}
                                style={{
                                    backgroundImage: `url("icons/${tile.image}.png")`,
                                    backgroundSize: "cover"
                                }}>
                            </button>
                        )}
                    </div>
                ))}
            </main>
        )
    }

}

class App extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        return <Board/>
    }
}

export default App;
