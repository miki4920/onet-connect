import React from 'react';
import {v4 as uuidv4} from 'uuid';
import './App.css';

class Tile {
    constructor() {
        this.image = "logo192.png"
    }
}

class Board extends React.Component {
    createBoard() {
        let board = []
        for(let y = 0; y < this.boardHeight + 2; y++) {
            let row = []
            for(let x = 0; x < this.boardWidth + 2; x++) {
                row.push(new Tile())
            }
            board.push(row)
        }
        return board
    }

    constructor(props) {
        super(props);
        this.boardWidth = 12;
        this.boardHeight = 6;
        this.board = this.createBoard()

    }

    render() {
        return (<main>
            {this.board.map((row) => (
                <div key={uuidv4()} className="row">
                    {row.map((tile) =>
                        <button key={uuidv4()} className="tile">
                            <img src={tile.image} alt="Tile"/>
                        </button>
                    )}
                </div>
            ))}
        </main>)
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
