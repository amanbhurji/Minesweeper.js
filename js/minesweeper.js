/*
 * Minesweeper
 * -- Manpreet Singh Bhurji
 *    http://msbhurji.com
 *
 * Steps to use -
 *  Include this file
 *  Create a div with id "embed_minesweeper"
 *  Call playMinesweeper() in your script
 *
 * Gameplay directions - 
 *  Click to uncover a cell
 *  Ctrl+click on a cell to flag it.
 *  Cheat will reveal the locations of the mines for 2 secs, 2 secs after clicking it
 *
 * Options -
 *  2 select boxes control number of mines in a game and the grid size
 *  
**/

function playMinesweeper() {
  var BOARD_ROWS, BOARD_COLS;
  var NUM_MINES, MINES_LEFT;
  var MINES_SET;
  var startTime, stopWatchId, now, selectedBoardSize, selectedGameLevel;
  var cells;
  
  initGame(8, 8, "begineer");
  function initGame(rows, cols, level) {
    // set initialization variables
    cells = [];
    MINES_SET=false;
    if(typeof level === "undefined") {
      level = "begineer";
    }
    BOARD_ROWS = rows;
    BOARD_COLS = cols;
    switch(level) {
      case "begineer":
        NUM_MINES = Math.floor(BOARD_ROWS*BOARD_COLS*0.15);
        break;
      case "intermediate":
        NUM_MINES = Math.floor(BOARD_ROWS*BOARD_COLS*0.2);
        break;
      case "expert":
        NUM_MINES = Math.floor(BOARD_ROWS*BOARD_COLS*0.3);
        break;
      default:
        NUM_MINES = Math.floor(BOARD_ROWS*BOARD_COLS*0.2);
    }
    MINES_LEFT = NUM_MINES;
    createEmptyMinefield();
  }
  
  setStyles();
  function setStyles() {
    // add css for minesweeper to page
    var style = document.createElement("style");
    style.setAttribute("type", "text/css");
    var css = "\
    #ms-container {\
      padding: 14px;\
    }\
    #ms-minefield {\
      border-spacing: 0;\
    }\
    .minecell {\
      height: 24px;\
      width: 20px;\
      background: #aceace;\
      border: solid 1px #ace;\
      text-align: center;\
    }\
    .flagged {\
      background: #ace;\
    }\
    .uncovered {\
      background: #f8f8ff;\
    }\
    #ms-statusbar {\
      margin: 5px 0;\
      font-size: 16px;\
    }\
    ";
    style.innerHTML = css;
    document.getElementsByTagName("head")[0].appendChild(style);
  }
  
  function createEmptyMinefield() {
    // create minesweeper grid
    var container = document.createElement("div");
    container.setAttribute("id", "ms-container");
    var i = 0, j = 0, option;
    
    // create options bar and the elements [selects, buttons] in it
    var optionsBar = document.createElement("div");
    optionsBar.setAttribute("id", "ms-optionsbar");
    
    var boardSizeSelect = document.createElement("select");
    boardSizeSelect.setAttribute("id", "ms-boardsize");
    var boardSizeOptions = [8,16,32];
    for (i=0; i<boardSizeOptions.length; i++) {
      option = document.createElement("option");
      option.setAttribute("value", boardSizeOptions[i]+"x"+boardSizeOptions[i]);
      option.innerHTML=boardSizeOptions[i]+"x"+boardSizeOptions[i];
      boardSizeSelect.appendChild(option);
      if (selectedBoardSize == option.getAttribute("value")) { // set previously selected board size as selected
        option.setAttribute("selected", "selected");
      }
    }
    
    var gameLevelSelect = document.createElement("select");
    gameLevelSelect.setAttribute("id", "ms-gamelevel");
    var gameLevelOptions = ["begineer", "intermediate", "expert"];
    for (i=0; i<gameLevelOptions.length; i++) {
      option = document.createElement("option");
      option.setAttribute("value", gameLevelOptions[i]);
      option.innerHTML=gameLevelOptions[i];
      gameLevelSelect.appendChild(option);
      if (selectedGameLevel == option.getAttribute("value")) { // set previously selected game level as selected
        option.setAttribute("selected", "selected");
      }
    }
    
    var newGame = document.createElement("input");
    newGame.setAttribute("id", "ms-newgame");
    newGame.setAttribute("type", "button");
    newGame.setAttribute("value", "New Game");
    function makeNewGame(event) {
      var size = document.getElementById("ms-boardsize").value;
      var level = document.getElementById("ms-gamelevel").value;
      document.getElementById("embed_minesweeper").innerHTML = "";
      window.clearInterval(stopWatchId);
      selectedBoardSize = size;
      selectedGameLevel = level;
      initGame(size.split("x")[0], size.split("x")[1], selectedGameLevel);
    }
    newGame.addEventListener("click", makeNewGame, false);
    
    var cheat = document.createElement("input");
    cheat.setAttribute("id", "ms-cheat");
    cheat.setAttribute("type", "button");
    cheat.setAttribute("value", "Cheat");
    function doCheat(event) {
      // incur 2 sec penaltly for cheating
      window.setTimeout(function() {
        for (i=0; i<BOARD_ROWS; i++) {
          for (j=0; j<BOARD_COLS; j++) {
            var curCell = cells[i][j];
            if(curCell.hasMine()) {
              var el = Cell.getTdFromCell(curCell);
              el.innerHTML="&#x2739;";
            }
          }
        }
        // remove after 2 sec
        window.setTimeout(function() {
          for (i=0; i<BOARD_ROWS; i++) {
            for (j=0; j<BOARD_COLS; j++) {
              var curCell = cells[i][j];
              if(curCell.hasMine()) {
                var el = Cell.getTdFromCell(curCell);
                el.innerHTML = "";
                // check if it has class "flagged"
                var hasClassFlagged = (new RegExp('(\\s|^)' + "flagged" + '(\\s|$)')).test(el.getAttribute("class"));
                if(hasClassFlagged) {
                  el.innerHTML = "&#x2691;";
                }
                var hasClassUncovered = (new RegExp('(\\s|^)' + "uncovered" + '(\\s|$)')).test(el.getAttribute("class"));
                if(hasClassUncovered) {
                  // do not remove mine if it is on a uncovered cell
                  // this is in case cheating after game over
                  el.innerHTML = "&#x2739;";
                }
              }
            }
          }
        }, 2000);
      }, 2000);
    }
    cheat.addEventListener("click", doCheat, false); // not removing listener after game over so that position of all mines may be seen
    
    container.appendChild(gameLevelSelect);
    container.appendChild(boardSizeSelect);
    container.appendChild(document.createElement("div"));
    container.appendChild(newGame);
    container.appendChild(cheat);
    
    var minefield = document.createElement("table");
    minefield.setAttribute("id", "ms-minefield");
    minefield.setAttribute("selectable", "disabled");
    
    for (i=0; i<BOARD_ROWS; i++) {
      var minerow = document.createElement("tr");
      var row = [];
      for (j=0; j<BOARD_COLS;j++) {
        var minecell = document.createElement("td");
        minecell.setAttribute("class", "minecell");
        minecell.setAttribute("id", "ms-"+i+"-"+j); // set id as ms-y-x
        minecell.addEventListener("click", cellClicked, false);
        minerow.appendChild(minecell);
        row.push(new Cell(j,i));
      }
      cells.push(row);
      minefield.appendChild(minerow);
    }
    container.appendChild(minefield);
    
    // create status bar and the elements [mines left, time elapsed] in it
    var statusBar = document.createElement("div");
    statusBar.setAttribute("id", "ms-statusbar");
    var timeElapsed = document.createElement("div");
    timeElapsed.setAttribute("id", "ms-timeelapsed");
    timeElapsed.innerHTML = "Time elapsed: ";
    var minesLeft = document.createElement("div");
    minesLeft.setAttribute("id", "ms-minesleft");
    minesLeft.innerHTML = "Mines left: "+MINES_LEFT;
    
    statusBar.appendChild(minesLeft);
    statusBar.appendChild(timeElapsed);
    
    container.appendChild(statusBar);
    document.getElementById("embed_minesweeper").appendChild(container);
  }
  
  function Cell(x,y) {
    // x and y are private variables
    this.getX = function() {return x;}
    this.getY = function() {return y;}
    this.mine = false;
    this.value = 0;
    this.uncovered = false;
    this.flag = false;
  }
  (function() {
    // member functions
    function Cell_getValue() {return this.value;}
    function Cell_setValue(value) {this.value = value;}
    
    function Cell_hasFlag() {return this.flag;}
    function Cell_setFlag(flag) {this.flag = flag;}
    
    function Cell_hasMine() {return this.mine;}
    function Cell_setMine(mine) {this.mine = mine;}
    
    function Cell_isUncovered() {return this.uncovered;}
    function Cell_setUncovered(uncovered) {this.uncovered = uncovered;}
    
    function Cell_unCoverNeighbours() {
      var neighbours = this.getNeighbours();
      var h;
      for(h = 0; h < neighbours.length; h++) {
        if(!neighbours[h].isUncovered()) {
          neighbours[h].unCoverCell();
        }
      }
    }
    
    function Cell_unCoverCell() {
      var el;
      if(!this.hasFlag() && !this.isUncovered()) {
        this.setUncovered(true);
        el = Cell.getTdFromCell(this);
        el.setAttribute("class", el.getAttribute("class") + " uncovered");
        if(this.hasMine()) {
          el.innerHTML = "&#x2739;";
          alert("Game over");
          window.clearInterval(stopWatchId);
          var minecells = document.getElementsByClassName("minecell"), 
              k = 0, kk = minecells.length;
          for(k=0; k<kk; k++) {
            minecells[k].removeEventListener("click", cellClicked, false);
          }
          return;
        }
        
        if(this.getValue() == 0) {
          this.unCoverNeighbours();
        } else {
          el.innerHTML = this.getValue();
        }
        el.removeEventListener("click", cellClicked, false);
        
      }
    }
    
    function Cell_getNeighbours() {
      var neighbours = [];
      if(this.getY() == 0) {
        neighbours.push(cells[this.getY() + 1][this.getX()]);          //bottom center
        if(this.getX() == 0) {                                       //three surrounding cells
          neighbours.push(cells[this.getY()][this.getX() + 1]);        //middle right
          neighbours.push(cells[this.getY() + 1][this.getX() + 1]);    //bottom right
        } else if(this.getX() == (BOARD_COLS - 1)) {                 //three surrounding cells
          neighbours.push(cells[this.getY()][this.getX() - 1]);        //middle left
          neighbours.push(cells[this.getY() + 1][this.getX() - 1]);    //bottom left
        } else {                                                     //five surrounding cells
          neighbours.push(cells[this.getY()][this.getX() - 1]);        //middle left
          neighbours.push(cells[this.getY()][this.getX() + 1]);        //middle right
          neighbours.push(cells[this.getY() + 1][this.getX() - 1]);    //bottom left
          neighbours.push(cells[this.getY() + 1][this.getX() + 1]);    //bottom right
        }
      } else if(this.getY() == (BOARD_ROWS - 1)) {
        neighbours.push(cells[this.getY() - 1][this.getX()]);          //top center
        if(this.getX() == 0) {                                       //three surrounding cells
          neighbours.push(cells[this.getY() - 1][this.getX() + 1]);    //top right
          neighbours.push(cells[this.getY()][this.getX() + 1]);        //middle right
        } else if(this.getX() == (BOARD_COLS - 1)) {                 //three surrounding cells
          neighbours.push(cells[this.getY() - 1][this.getX() - 1]);    //top left
          neighbours.push(cells[this.getY()][this.getX() - 1]);        //middle left
        } else {                                                     //five surrounding cells
          neighbours.push(cells[this.getY() - 1][this.getX() - 1]);    //top left
          neighbours.push(cells[this.getY() - 1][this.getX() + 1]);    //top right
          neighbours.push(cells[this.getY()][this.getX() - 1]);        //middle left
          neighbours.push(cells[this.getY()][this.getX() + 1]);        //middle right
        }
      } else {
        neighbours.push(cells[this.getY() - 1][this.getX()]);          //top center
        neighbours.push(cells[this.getY() + 1][this.getX()]);          //bottom center
        if(this.getX() == 0){                                        //five surrounding cells
          neighbours.push(cells[this.getY() - 1][this.getX() + 1]);    //top right
          neighbours.push(cells[this.getY()][this.getX() + 1]);        //middle right
          neighbours.push(cells[this.getY() + 1][this.getX() + 1]);    //bottom right
        } else if(this.getX() == (BOARD_COLS - 1)){                  //five surrounding cells
          neighbours.push(cells[this.getY() - 1][this.getX() - 1]);    //top left
          neighbours.push(cells[this.getY()][this.getX() - 1]);        //middle left
          neighbours.push(cells[this.getY() + 1][this.getX() - 1]);    //bottom left
        } else{                                                      //eight surrounding cells
          neighbours.push(cells[this.getY() - 1][this.getX() - 1]);    //top left
          neighbours.push(cells[this.getY() - 1][this.getX() + 1]);    //top right
          neighbours.push(cells[this.getY()][this.getX() - 1]);        //middle left
          neighbours.push(cells[this.getY()][this.getX() + 1]);        //middle right
          neighbours.push(cells[this.getY() + 1][this.getX() - 1]);    //bottom left
          neighbours.push(cells[this.getY() + 1][this.getX() + 1]);    //bottom right
        }
      }
      return neighbours;
    }
    
    Cell.prototype.getValue = Cell_getValue;
    Cell.prototype.setValue = Cell_setValue;
    Cell.prototype.hasFlag = Cell_hasFlag;
    Cell.prototype.setFlag = Cell_setFlag;
    Cell.prototype.hasMine = Cell_hasMine;
    Cell.prototype.setMine = Cell_setMine;
    Cell.prototype.isUncovered = Cell_isUncovered;
    Cell.prototype.setUncovered = Cell_setUncovered;
    Cell.prototype.unCoverNeighbours = Cell_unCoverNeighbours;
    Cell.prototype.unCoverCell = Cell_unCoverCell;
    Cell.prototype.getNeighbours = Cell_getNeighbours;
  })();
  
  // static functions
  Cell.getCellFromTd = function(el) {
    var id = el.id;
    var splitId = id.split("-");
    return cells[splitId[1]][splitId[2]];
  }
  
  Cell.getTdFromCell = function (cell) {
    var x = cell.getX();
    var y = cell.getY();
    return document.getElementById("ms-"+y+"-"+x);
  }
  
  // put mines on the board (only after a click on the board)
  function putMines(el) {
    startTime = new Date();
    stopWatchId = window.setInterval(stopWatch, 100);
    function stopWatch() {
      now = new Date();
      var seconds=parseInt((now-startTime)/1000);
      var timeElapsed = document.getElementById("ms-timeelapsed");
      timeElapsed.innerHTML = "Time elapsed: " + seconds + " secs";
    }
    var cell = Cell.getCellFromTd(el);
    var minesCount = NUM_MINES;
    var r, mineRow, mineCell;
    while(minesCount > 0) {
      r = Math.round(Math.random()*((BOARD_ROWS * BOARD_COLS) - 1));
      mineRow = Math.floor(r / BOARD_COLS);
      mineCol = r % BOARD_COLS;
      if( !(cells[mineRow][mineCol].hasMine() || 
            cells[mineRow][mineCol]==cell || 
            cell.getNeighbours().indexOf(cells[mineRow][mineCol])!=-1) ) { // make cell first clicked a blank
//      if( !cells[mineRow][mineCol].hasMine() ) { // does not set first cell clicked as a blank
        cells[mineRow][mineCol].setMine(true);
        minesCount--;
      }
    }
  }
  
  // arrange appropriate values in cells
  function arrangeValues() {
    var value=0, cell, cellNeighbours;
    for(var k=0; k < BOARD_ROWS; k++) {
      for(var l=0; l < BOARD_COLS; l++) {
        cell = cells[k][l];
        cellNeighbours = cell.getNeighbours();
        value = 0;
        for(var d = 0, dd = cellNeighbours.length; d < dd; d++) {
          if(cellNeighbours[d].hasMine()) {
            value++;
          }
        }
        cell.setValue(value);
      }
    }
  }
  
  // check if user has won the game
  function isWon() {
    var count=0;
    for(var k=0; k < BOARD_ROWS; k++) {
      for(var l=0; l < BOARD_COLS; l++) {
        if(cells[k][l].isUncovered() && !cells[k][l].hasMine())
          count++;
      }
    }
    if(BOARD_ROWS*BOARD_COLS-count==NUM_MINES)
      return true;
    return false;
  }
  
  // function to bind to click event on a cell
  function cellClicked(event) {
    if(!MINES_SET) {
      putMines(this);
      arrangeValues();
      MINES_SET = true;
    }
    var cell = Cell.getCellFromTd(this);
    if(event.ctrlKey) {
      var minesLeft = document.getElementById("ms-minesleft");
      if(!cell.hasFlag()) {
        if(MINES_LEFT!=0) { 
          cell.setFlag(!cell.hasFlag());
          this.setAttribute("class", this.getAttribute("class") + " flagged");
          this.innerHTML = "&#x2691;";
          MINES_LEFT--;
          minesLeft.innerHTML = "Mines left: " + MINES_LEFT;
        }
      } else {
        cell.setFlag(!cell.hasFlag());
        this.innerHTML = "";
        var classes = this.getAttribute("class");
        // remove class "flagged"
        classes = classes.replace(new RegExp('(\\s|^)' + "flagged" + '(\\s|$)'), ' ').replace(/\s+/g, ' ').replace(/^\s|\s$/, '');
        this.setAttribute("class", classes);
        MINES_LEFT++;
        minesLeft.innerHTML = "Mines left: " + MINES_LEFT;
      }
    } else {
      cell.unCoverCell();
      if(isWon()) {
        window.clearInterval(stopWatchId);
        var yourTime = parseFloat((now-startTime)/1000);
        var alertString = "Game won!\nYour time:" + yourTime + " secs";
        try {
          // save highscores in localStorage
          var scores = localStorage.getItem("highscores");
          if (scores) {
            scores = scores.split(",");
            scores.push(yourTime);
            scores.map(parseFloat);
            function numerical(a, b) {return a-b;}
            scores.sort(numerical);
            scores = scores.slice(0, 5);
            alertString+="\nHigh scores:\n";
            alertString+=scores.join(", ");
            localStorage.setItem("highscores", scores);
          } else {
            localStorage.setItem("highscores", yourTime);
            alertString+="\nHigh scores:\n";
            alertString+=yourTime;
          }
        }catch(e) {}
        alert(alertString);
        var minecells = document.getElementsByClassName("minecell"), 
            k = 0, kk = minecells.length;
        for(k=0; k<kk; k++) {
          minecells[k].removeEventListener("click", cellClicked, false);
        }
      }
    }
  }
}
