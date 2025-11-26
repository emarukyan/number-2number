Game.
With a given board: 8x8.
each cell has number and color
each row and each column, has SUMMA.

Game starts with preloaded board from game-levels.json
Game goal: by clicking on the board, user changes state of the cell.

Cells have three states: Default (used in calucaltions), Ignored - is eliminated from calc. Circled - (used in calucaltions)

First click - deactivated that number, and it's opacity fails to 30% - and that cell will not be calculated inthe row and in the cell and as a color set.
Second Click - re-activates cell and draws a circle border for that number. meaning that this cell is picked.
Third click - clears cell state.

---

WHen user cilcks on CHECK button, you should check all the sums of rows and columns - to match cells sum that are left active.
Also you should check wether COLOR set summs is equal to the one that is given in the game start.

---

Make html and js code this game, put logic in @game.js
