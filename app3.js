// constants and variables
let mark = 0;
let cellArray = [];
let bombCells = [];
let randomBombArray = [];


// constructor for the object "cell"
class Cell {
    constructor (id, count, bomb, viewed, marked, question, surroundingCells, row, column) {
        this.id = id,
        this.count = count,
        this.bomb = bomb,
        this.viewed = viewed,
        this.marked = marked,
        this.question = question,
        this.surroundingCells = surroundingCells,
        this.row = row,
        this.column = column
    }
}


const mineSweeper = {
    difficulties: {
        easy : {
            rows: 8,
            columns: 8,
            mines: 10
        },
        normal : {
            rows: 15,
            columns: 15,
            mines: 30
        },
        hard : {
            rows: 20,
            columns: 20,
            mines: 100
        }
    },
    drawBoard: function (difficulty='easy') {
        difficulty = this.difficulties[difficulty];
        let rows = difficulty.rows;
        let columns = difficulty.columns;
        let mines = difficulty.mines;

        // creation of the board (8 * 8), attribution of classes + ids, stocking the cells inside an array (cellArray)
        function swipeBoard() {
            if (document.querySelector('table')) {
                let div = document.querySelector('.board');
                let board = document.querySelector('table');
                div.removeChild(board);
                let newBoard = document.createElement('table');
                div.append(newBoard);
                newBoard.className = 'game-board';
                mark = 0;
                cellArray = [];
                bombCells = [];
                randomBombArray = [];
            } else {
                let div = document.querySelector('.board');
                let newBoard = document.createElement('table');
                div.append(newBoard);
                newBoard.className = 'game-board';
                mark = 0;
                cellArray = [];
                bombCells = [];
                randomBombArray = [];
            }
        }

        function createBoard() {
            swipeBoard();
            let board = document.querySelector('table');
            for (let i = 0; i < rows; i++) {
                let row = document.createElement("tr");
                row.className = 'row';
                board.appendChild(row);
                for (let j = 0; j < columns; j++) {
                    cell = document.createElement("td");
                    cell.className = 'cell';
                    row.appendChild(cell);
                    cell._cell = new Cell(0, 0, false, false, false, false, [], cell.parentNode.rowIndex, cell.cellIndex);
                    cellArray.push(cell._cell);
                    cell.id = cellArray.indexOf(cell._cell);
                    cell._cell.id = cellArray.indexOf(cell._cell);
                }
            }
        }

        createBoard();

        //////////variables after board creation//////////
        let tds = document.querySelectorAll('td');
        let rowIndex = []
        let columnIndex = []
        ////////// End variables after board creation//////////

        // creation of 8 "bombs" in random cells
        while (randomBombArray.length < mines) {
            randomBomb = cellArray[Math.floor(Math.random() * cellArray.length)];
            if (randomBomb.bomb === false) {
                randomBomb.bomb = true;
                randomBombArray.push(randomBomb);
            }
        }

        // Placing numbers inside the board
        tds.forEach((td) => {
            // sifting through tds, if bomb found, taking its coordinates (row + column), 
            //then placing each coordinates AND coordinates -1 and +1 inside two arrays. 
            // THEN, sifting through the tds again, but also through each array (rows and columns). 
            //If a td has the right coordinates (means it's adjacent to the first cell), count + 1
            if (td._cell.bomb === true) {
                let column = td.cellIndex;
                let row = td.parentNode.rowIndex;
                
                rowIndex.push(row-1, row, row+1)
                columnIndex.push(column-1, column, column+1)

                tds.forEach((td) => {
                    for (let y = 0; y < rowIndex.length; y++) {
                        for (let x = 0; x < columnIndex.length; x++) {
                            if (td.parentNode.rowIndex === rowIndex[y] && td.cellIndex === columnIndex[x]) {
                                if (td._cell.bomb === false) {
                                    td._cell.count += 1;
                                }
                            }
                        }
                    }
                })
                rowIndex = []
                columnIndex = []
            }
        })

        // infos printed inside the board
        tds.forEach((td) => {
            if (td._cell.count >= 1 && td._cell.bomb === false) {
            td.innerHTML =  td._cell.count;
            }
        })
    

        /////////////////// function to reveal hidden elements on click ////////////////////

        function stockingSurroundingCells() {
            tds.forEach((td) => {
                let rowArray = [];
                let columnArray = [];
                
                let column = td.cellIndex;
                let row = td.parentNode.rowIndex;
                
                rowArray.push(row-1, row, row+1);
                columnArray.push(column-1, column, column+1);

                tds.forEach((cell) => {
                    for (let y = 0; y < rowArray.length; y++) {
                        for (let x = 0; x < columnArray.length; x++) {
                            if (cell.parentNode.rowIndex === rowArray[y] && cell.cellIndex === columnArray[x]) {
                                td._cell.surroundingCells.push(cell);
                                }
                            }
                        }
                })
                rowArray = [];
                columnArray = [];
            })
        }

        stockingSurroundingCells();

        tds.forEach((td) => {

            function view() {
                if (td._cell.viewed === false) {
                    td.style.opacity = 0;
                } else {
                    td.style.opacity = 1;
                }
            }
            view()
            
            td.onclick = () => {
            
                if (td._cell.bomb === false) {
                    //td.innerHTML =  td._cell.count;
                    if (td._cell.count === 0) {
                        //////////////////// function to reveal cells with count === 0 ////////////////////  
                        function scanningSurroundingCells(td) {
                            td._cell.surroundingCells.forEach((surroundingCell, index) => {
                                if (surroundingCell._cell.bomb === false && surroundingCell._cell.viewed === false && surroundingCell._cell.marked === false) {
                                    surroundingCell._cell.viewed = true;
                                    surroundingCell.style.opacity = 1;
                                    if (surroundingCell._cell.count === 0) {
                                    scanningSurroundingCells(surroundingCell);
                                    }
                                }
                            }) 
                        }   
                        //////////////////// function to reveal cells with count === 0 ////////////////////
                        scanningSurroundingCells(td);
                    }  
                    else if (td._cell.count >= 1 && td._cell.count <= 8) {
                        td._cell.marked = false;
                        td._cell.question = false;
                        td._cell.viewed = true; 
                    }
                }    
                else if (td._cell.bomb === true && td._cell.marked === true) {
                    //if the cell is a bomb and contains an img (from the flag mark), delete it and then create another img with a bomb. If not marked, creates a bomb img.
                    if (td.contains(document.querySelector('img'))) {
                        let img = document.querySelector('img')
                        td.removeChild(img);
                        td._cell.marked = false;
                        td._cell.question = false;
                        img = document.createElement('img');
                        img.src = "./img/bomb_exploded.png";
                        td.append(img);
                        td._cell.viewed = true;
                        alert('Vous avez perdu');
                        this.drawBoard();
                    } 
                }
                else if (td._cell.bomb === true && td._cell.marked === false) {
                    img = document.createElement('img');
                    img.src = "./img/bomb_exploded.png";
                    td.append(img);
                    td._cell.viewed = true;
                    alert('vous avez perdu.');
                    this.drawBoard();
                } 
                view();
            }
        })

        /////////////////// End function to reveal hidden elements on click ////////////////////

        //////////////////////////// Function to mark cell ////////////////////////////////

        // counting number of bombs to have the right number of "marks"
        tds.forEach((td) => {
            if (td._cell.bomb === true) {
                mark ++;
            }
            let flags = document.querySelector('.flags');
            flags.innerHTML = mark;
        })
        //console.log(mark)

        tds.forEach((td) => {
        td.addEventListener('contextmenu', e => {
                e.preventDefault();
                if (mark > 0 && td._cell.marked === false && td._cell.viewed === false) {
                    td.innerHTML = "";
                    let img = document.createElement('img');
                    img.className = 'flag';
                    img.src = "./img/flag.png";
                    td.appendChild(img);
                    td._cell.marked = true;
                    td.style.opacity = 1;
                    mark--;
                    let flags = document.querySelector('.flags');
                    flags.innerHTML = mark;
                } 
                else if(td._cell.marked === true && td._cell.viewed === false) {
                    td._cell.viewed = false;
                    td._cell.marked = false;
                    let img = td.querySelector('img');
                    td.removeChild(img);
                    td.style.opacity = 0;
                    mark ++;
                    let flags = document.querySelector('.flags');
                    flags.innerHTML = mark;
                }
            })
        })

        //////////////////////////// End function to mark cell ////////////////////////////////
        function victory() {
            let count = 0;
            tds.forEach((td) => {
                ['click', 'contextmenu'].forEach((e) => {
                    td.addEventListener(e, function(){
                        if (td._cell.bomb === true && td._cell.viewed === false && td._cell.marked === true) {
                            if (mark === 0) {
                                alert ('vous avez gagné!');
                                mineSweeper.drawBoard();
                            } 
                        }
                    })
                })
            })
        }
    victory();
    }
}

mineSweeper.drawBoard();

