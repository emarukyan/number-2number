// Game state
let currentLevel = null
let cellStates = [] // 0 = default, 1 = ignored, 2 = circled
let lives = 3
let hintsRemaining = 1

// Game levels data
const gameLevels = [
  {
    id: 10,
    boardNumbers: [
      [3, 7, 5, 4, 1, 6, 3, 3],
      [2, 3, 6, 9, 6, 3, 1, 3],
      [1, 5, 2, 5, 5, 6, 2, 7],
      [2, 1, 8, 1, 4, 5, 4, 6],
      [9, 2, 8, 5, 5, 4, 3, 3],
      [8, 4, 1, 6, 4, 7, 6, 3],
      [7, 7, 4, 4, 3, 2, 5, 2],
      [6, 7, 3, 4, 9, 4, 4, 3],
    ],
    boardColors: [
      [8, 8, 8, 8, 2, 2, 2, 2],
      [8, 8, 5, 8, 1, 2, 2, 2],
      [5, 5, 5, 8, 1, 1, 1, 2],
      [5, 5, 5, 1, 1, 1, 1, 7],
      [5, 3, 3, 3, 3, 7, 7, 7],
      [4, 3, 3, 3, 6, 7, 7, 7],
      [4, 4, 4, 3, 6, 7, 6, 6],
      [4, 4, 4, 4, 6, 6, 6, 6],
    ],
    columnsSum: [24, 2, 11, 14, 16, 23, 17, 3],
    rowsSum: [7, 15, 13, 16, 14, 18, 14, 13],
    colorsSums: [
      ["violet", 27],
      ["#a3abe4", 4],
      ["#baffc9", 7],
      ["orange", 24],
      ["yellow", 8],
      ["#eecec1", 9],
      ["#c0ddff", 19],
      ["#ffb1b1", 12],
    ],
  },
]

// Color mapping - derive from the current level's colorsSums
function getColorMap(level) {
  const colorMap = {}
  level.colorsSums.forEach((colorSum, index) => {
    colorMap[index + 1] = colorSum[0] // index+1 because color IDs start at 1
  })
  return colorMap
}

// Initialize with the first level's colors (will be updated when level loads)
let colorMap = getColorMap(gameLevels[0])

// Initialize game
function initGame(levelId = 10) {
  currentLevel = gameLevels.find((level) => level.id === levelId)

  if (!currentLevel) {
    console.error("Level not found")
    return
  }

  // Update color map for this level
  colorMap = getColorMap(currentLevel)

  // Initialize cell states (all default)
  cellStates = Array(8)
    .fill(null)
    .map(() => Array(8).fill(0))

  // Update UI
  document.getElementById("level-number").textContent = currentLevel.id
  updateHearts()
  renderBoard()
  renderSums()
  clearMessage()
}

// Render the game board
function renderBoard() {
  const board = document.getElementById("board")
  board.innerHTML = ""

  // Track which colors we've seen to show sum only on first occurrence
  const seenColors = new Set()

  // Build a map of color -> sum for quick lookup
  const colorSumMap = {}
  currentLevel.colorsSums.forEach(([color, sum]) => {
    colorSumMap[color] = sum
  })

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = document.createElement("div")
      cell.className = "cell"

      const colorId = currentLevel.boardColors[row][col]
      const cellColor = colorMap[colorId]
      cell.style.backgroundColor = cellColor

      // If this is the first cell of this color, add the sum badge
      if (!seenColors.has(cellColor)) {
        seenColors.add(cellColor)
        const sumBadge = document.createElement("span")
        sumBadge.className = "color-sum-badge"
        sumBadge.textContent = colorSumMap[cellColor] || "?"
        cell.appendChild(sumBadge)
      }

      // Add the main number
      const numberSpan = document.createElement("span")
      numberSpan.textContent = currentLevel.boardNumbers[row][col]
      cell.appendChild(numberSpan)

      cell.dataset.row = row
      cell.dataset.col = col

      cell.addEventListener("click", () => handleCellClick(row, col))

      updateCellState(cell, row, col)
      board.appendChild(cell)
    }
  }
}

// Handle cell click
function handleCellClick(row, col) {
  cellStates[row][col] = (cellStates[row][col] + 1) % 3

  const cellIndex = row * 8 + col
  const cell = document.getElementById("board").children[cellIndex]
  updateCellState(cell, row, col)

  clearMessage()
}

// Update cell appearance based on state
function updateCellState(cell, row, col) {
  const state = cellStates[row][col]
  cell.classList.remove("ignored", "circled")

  if (state === 1) {
    cell.classList.add("ignored")
  } else if (state === 2) {
    cell.classList.add("circled")
  }
}

// Render column and row sums
function renderSums() {
  const columnSumsDiv = document.getElementById("column-sums")
  const rowSumsDiv = document.getElementById("row-sums")

  columnSumsDiv.innerHTML = ""
  rowSumsDiv.innerHTML = ""

  // Column sums
  currentLevel.columnsSum.forEach((sum) => {
    const div = document.createElement("div")
    div.className = "column-sum"
    div.textContent = sum
    columnSumsDiv.appendChild(div)
  })

  // Row sums
  currentLevel.rowsSum.forEach((sum) => {
    const div = document.createElement("div")
    div.className = "row-sum"
    div.textContent = sum
    rowSumsDiv.appendChild(div)
  })

  // Color sums - now displayed in cells, so we skip rendering this section
  const colorSumsDiv = document.getElementById("color-sums")
  colorSumsDiv.innerHTML = ""
}

// Calculate current sums based on active cells
function calculateCurrentSums() {
  const rowSums = Array(8).fill(0)
  const colSums = Array(8).fill(0)
  const colorSums = {}

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      // Only count cells that are not ignored (state 0 or 2)
      if (cellStates[row][col] !== 1) {
        const value = currentLevel.boardNumbers[row][col]
        const colorId = currentLevel.boardColors[row][col]
        const color = colorMap[colorId]

        rowSums[row] += value
        colSums[col] += value
        colorSums[color] = (colorSums[color] || 0) + value
      }
    }
  }

  return { rowSums, colSums, colorSums }
}

// Check if solution is correct
function checkSolution() {
  const { rowSums, colSums, colorSums } = calculateCurrentSums()

  let isCorrect = true
  let errors = []

  // Check row sums
  for (let i = 0; i < 8; i++) {
    if (rowSums[i] !== currentLevel.rowsSum[i]) {
      isCorrect = false
      errors.push(
        `Row ${i + 1}: Expected ${currentLevel.rowsSum[i]}, got ${rowSums[i]}`
      )
    }
  }

  // Check column sums
  for (let i = 0; i < 8; i++) {
    if (colSums[i] !== currentLevel.columnsSum[i]) {
      isCorrect = false
      errors.push(
        `Column ${i + 1}: Expected ${currentLevel.columnsSum[i]}, got ${
          colSums[i]
        }`
      )
    }
  }

  // Check color sums
  currentLevel.colorsSums.forEach(([color, expectedSum]) => {
    const actualSum = colorSums[color] || 0
    if (actualSum !== expectedSum) {
      isCorrect = false
      errors.push(`Color ${color}: Expected ${expectedSum}, got ${actualSum}`)
    }
  })

  return { isCorrect, errors }
}

// Handle check button click
document.getElementById("btn-check").addEventListener("click", () => {
  const { isCorrect, errors } = checkSolution()

  if (isCorrect) {
    showMessage("🎉 Congratulations! You solved it!", "success")
  } else {
    lives--
    updateHearts()

    if (lives > 0) {
      showMessage(
        `❌ Not quite right. ${lives} ${
          lives === 1 ? "life" : "lives"
        } remaining. Keep trying!`,
        "error"
      )
      console.log("Errors:", errors)
    } else {
      showMessage("💔 Game Over! Resetting...", "error")
      setTimeout(() => {
        lives = 3
        initGame(currentLevel.id)
      }, 2000)
    }
  }
})

// Handle reset button click
document.getElementById("btn-reset").addEventListener("click", () => {
  if (confirm("Are you sure you want to reset the board?")) {
    cellStates = Array(8)
      .fill(null)
      .map(() => Array(8).fill(0))
    renderBoard()
    clearMessage()
  }
})

// Handle hint button click
document.getElementById("btn-hint").addEventListener("click", () => {
  if (hintsRemaining <= 0) {
    showMessage("No hints remaining!", "error")
    return
  }

  // Find a cell that needs to be changed
  const { rowSums, colSums } = calculateCurrentSums()

  // Find first wrong row or column
  for (let row = 0; row < 8; row++) {
    if (rowSums[row] !== currentLevel.rowsSum[row]) {
      showMessage(
        `💡 Hint: Check row ${row + 1} - current sum is ${
          rowSums[row]
        }, should be ${currentLevel.rowsSum[row]}`,
        "success"
      )
      hintsRemaining--
      document.getElementById(
        "btn-hint"
      ).textContent = `💡 Hint (${hintsRemaining})`
      if (hintsRemaining === 0) {
        document.getElementById("btn-hint").disabled = true
        document.getElementById("btn-hint").style.opacity = "0.5"
      }
      return
    }
  }

  for (let col = 0; col < 8; col++) {
    if (colSums[col] !== currentLevel.columnsSum[col]) {
      showMessage(
        `💡 Hint: Check column ${col + 1} - current sum is ${
          colSums[col]
        }, should be ${currentLevel.columnsSum[col]}`,
        "success"
      )
      hintsRemaining--
      document.getElementById(
        "btn-hint"
      ).textContent = `💡 Hint (${hintsRemaining})`
      if (hintsRemaining === 0) {
        document.getElementById("btn-hint").disabled = true
        document.getElementById("btn-hint").style.opacity = "0.5"
      }
      return
    }
  }

  showMessage("💡 Everything looks good so far!", "success")
})

// Update hearts display
function updateHearts() {
  const heartsDiv = document.getElementById("hearts")
  heartsDiv.textContent = "❤️".repeat(lives)
}

// Show message
function showMessage(text, type) {
  const messageDiv = document.getElementById("message")
  messageDiv.textContent = text
  messageDiv.className = `message ${type}`
}

// Clear message
function clearMessage() {
  const messageDiv = document.getElementById("message")
  messageDiv.textContent = ""
  messageDiv.className = "message"
}

// Initialize the game when page loads
initGame(10)
