var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a;
var Field = /** @class */ (function () {
    function Field(size) {
        if (size === void 0) { size = 5; }
        this.size = size;
        this.rows = [];
        this.columns = [];
        this.diagonals = [new Line(), new Line()];
        this.cells = [];
        for (var i = 0; i < size; i++) {
            var row = new Line();
            this.rows.push(row);
            for (var j = 0; j < size; j++) {
                if (i === 0) {
                    this.columns.push(new Line());
                }
                var column = this.columns[j];
                var cell = new Cell(i * size + j + 1, this, row, column);
                row.cells.push(cell);
                column.cells.push(cell);
                this.cells.push(cell);
                if (i === j) {
                    this.diagonals[0].cells.push(cell);
                    cell.lines.push(this.diagonals[0]);
                    cell.diagonals.push(this.diagonals[0]);
                }
                if (i + j + 1 === size) {
                    this.diagonals[1].cells.push(cell);
                    cell.lines.push(this.diagonals[1]);
                    cell.diagonals.push(this.diagonals[1]);
                }
            }
        }
        this.lines = __spreadArray(__spreadArray(__spreadArray([], this.columns, true), this.rows, true), this.diagonals, true);
    }
    Object.defineProperty(Field.prototype, "linesCompleted", {
        get: function () {
            var count = 0;
            for (var i = 0; i < this.lines.length; i++) {
                if (this.lines[i].isComplete) {
                    count++;
                }
            }
            return count;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Field.prototype, "hasRedundantCells", {
        get: function () {
            outer: for (var _i = 0, _a = this.cells; _i < _a.length; _i++) {
                var cell = _a[_i];
                if (!cell.used) {
                    continue;
                }
                for (var _b = 0, _c = cell.lines; _b < _c.length; _b++) {
                    var line = _c[_b];
                    if (line.isComplete) {
                        continue outer;
                    }
                }
                return true;
            }
            return false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Field.prototype, "usedCellCount", {
        get: function () {
            var count = 0;
            for (var _i = 0, _a = this.cells; _i < _a.length; _i++) {
                var cell = _a[_i];
                if (cell.used) {
                    count++;
                }
            }
            return count;
        },
        enumerable: false,
        configurable: true
    });
    Field.prototype.reset = function () {
        for (var _i = 0, _a = this.cells; _i < _a.length; _i++) {
            var cell = _a[_i];
            cell.used = false;
        }
    };
    Field.prototype.finishable = function (targetPattern, maxMoves) {
        var movesNeeded = 0;
        for (var i = 0; i < this.cells.length; i++) {
            if (targetPattern.cells[i].used && !this.cells[i].used) {
                movesNeeded++;
                if (movesNeeded > maxMoves) {
                    return false;
                }
            }
        }
        return true;
    };
    Field.prototype.clone = function () {
        var clone = new Field(this.size);
        for (var i = 0; i < this.cells.length; i++) {
            clone.cells[i].used = this.cells[i].used;
        }
        return clone;
    };
    Field.prototype.print = function () {
        for (var _i = 0, _a = this.rows; _i < _a.length; _i++) {
            var row = _a[_i];
            var output = '';
            for (var _b = 0, _c = row.cells; _b < _c.length; _b++) {
                var cell = _c[_b];
                output += cell.used ? 'x ' : 'o ';
            }
            console.log(output);
        }
    };
    return Field;
}());
var Line = /** @class */ (function () {
    function Line() {
        this.cells = [];
    }
    Object.defineProperty(Line.prototype, "isComplete", {
        get: function () {
            for (var i = 0; i < this.cells.length; i++) {
                if (!this.cells[i].used) {
                    return false;
                }
            }
            return true;
        },
        enumerable: false,
        configurable: true
    });
    return Line;
}());
var Cell = /** @class */ (function () {
    function Cell(id, field, row, column) {
        this.id = id;
        this.field = field;
        this.row = row;
        this.column = column;
        this.used = false;
        this.lines = [];
        this.diagonals = [];
        this.lines.push(row, column);
    }
    Cell.prototype.getLineCompletionDesc = function () {
        var counts = [];
        for (var _i = 0, _a = this.lines; _i < _a.length; _i++) {
            var line = _a[_i];
            var lineCount = 0;
            for (var _b = 0, _c = line.cells; _b < _c.length; _b++) {
                var cell = _c[_b];
                if (cell.used) {
                    lineCount++;
                }
            }
            counts.push(lineCount);
        }
        return counts.sort(function (a, b) { return b - a; });
    };
    Cell.prototype.use = function () {
        if (this.used) {
            throw new Error('Cell already used.');
        }
        this.used = true;
    };
    return Cell;
}());
function getRandomFreeCell(cells) {
    var freeCells = cells.filter(function (cell) { return !cell.used; });
    if (freeCells.length === 0) {
        return null;
    }
    return freeCells[Math.floor(Math.random() * freeCells.length)];
}
function getMostCompleteCell(cells) {
    var bestCell;
    var bestCounts = [];
    for (var _i = 0, cells_1 = cells; _i < cells_1.length; _i++) {
        var cell = cells_1[_i];
        if (cell.used)
            continue;
        var counts = cell.getLineCompletionDesc();
        for (var i = 0; i < counts.length || i < bestCounts.length; i++) {
            if (bestCounts[i] === undefined || counts[i] > bestCounts[i]) {
                bestCounts = counts;
                bestCell = cell;
                break;
            }
            else if (counts[i] === undefined || counts[i] < bestCounts[i]) {
                break;
            }
        }
    }
    return bestCell;
}
function getHottestCell(field, remainingMoves) {
    var heatmap = getHeatMapOfBestPatterns(field, remainingMoves);
    lastUsedHeatmap = heatmap;
    if (!heatmap) {
        return getMostCompleteCell(field.cells);
    }
    var baseCells = field.cells;
    var hotCells = [];
    do {
        var maxHeat = Number.NEGATIVE_INFINITY;
        for (var i = 0; i < baseCells.length; i++) {
            var cell = baseCells[i];
            if (cell.used) {
                continue;
            }
            var heat = heatmap[cell.id - 1];
            if (heat > maxHeat) {
                maxHeat = heat;
                hotCells = [cell];
            }
            else if (heat === maxHeat) {
                hotCells.push(cell);
            }
        }
        if (hotCells.length === 1) {
            break;
        }
        remainingMoves--;
        heatmap = getHeatMapOfBestPatterns(field, remainingMoves, false);
        if (!heatmap || remainingMoves === 1) {
            break;
        }
        baseCells = hotCells;
        hotCells = [];
    } while (true);
    return getMostCompleteCell(hotCells);
}
function getHeatMapOfBestPatterns(field, remainingMoves, updateLastUsed) {
    if (updateLastUsed === void 0) { updateLastUsed = true; }
    var patterns = [];
    var _loop_1 = function (i) {
        var patternLib = patternLibs[i];
        patterns = patternLib.patterns.filter(function (pattern) { return field.finishable(pattern, remainingMoves - patternLib.remainingMovesOffset); });
        if (patterns.length > 0) {
            if (updateLastUsed) {
                lastUsedPatterns = "".concat(patternLib.lines, "-line patterns finishable with ").concat(16 - patternLib.remainingMovesOffset, " moves");
            }
            return "break";
        }
    };
    for (var i = 0; i < patternLibs.length; i++) {
        var state_1 = _loop_1(i);
        if (state_1 === "break")
            break;
    }
    if (patterns.length === 0) {
        if (updateLastUsed) {
            lastUsedPatterns = 'None - only 1-line solutions possible.';
        }
        return null;
    }
    return createHeatmap(patterns);
}
function createHeatmap(patterns) {
    var heatmap = Array(patterns[0].cells.length).fill(0);
    for (var _i = 0, patterns_1 = patterns; _i < patterns_1.length; _i++) {
        var pattern = patterns_1[_i];
        for (var i = 0; i < pattern.cells.length; i++) {
            if (pattern.cells[i].used) {
                heatmap[i]++;
            }
        }
    }
    return heatmap;
}
function createPatterns(targetLines, maxMoves, field, line, index, indices, patterns) {
    if (targetLines === void 0) { targetLines = 4; }
    if (maxMoves === void 0) { maxMoves = 16; }
    if (field === void 0) { field = new Field(); }
    if (line === void 0) { line = 1; }
    if (index === void 0) { index = 0; }
    if (indices === void 0) { indices = []; }
    if (patterns === void 0) { patterns = {}; }
    for (; index < field.lines.length - targetLines + line; index++) {
        indices.push(index);
        if (line === targetLines) {
            for (var _i = 0, indices_1 = indices; _i < indices_1.length; _i++) {
                var lineIndex = indices_1[_i];
                for (var cellIndex = 0; cellIndex < field.lines[lineIndex].cells.length; cellIndex++) {
                    field.lines[lineIndex].cells[cellIndex].used = true;
                }
            }
            var moves = 0;
            for (var _a = 0, _b = field.cells; _a < _b.length; _a++) {
                var cell = _b[_a];
                if (cell.used) {
                    moves++;
                }
            }
            if (moves <= maxMoves) {
                if (!patterns[moves]) {
                    patterns[moves] = [];
                }
                patterns[moves].push(field.clone());
            }
            field.reset();
        }
        else {
            createPatterns(targetLines, maxMoves, field, line + 1, index + 1, indices, patterns);
        }
        indices.pop();
    }
    return patterns;
}
var fourLinePatterns = createPatterns(4);
console.assert(Object.keys(fourLinePatterns).length === 3);
var fourLinePatterns14Moves = fourLinePatterns[14];
var fourLinePatterns15Moves = fourLinePatterns[15];
var fourLinePatterns16Moves = fourLinePatterns[16];
var fourLinePatterns14And15Moves = fourLinePatterns14Moves.concat(fourLinePatterns15Moves);
var allFourLinePatterns = fourLinePatterns14And15Moves.concat(fourLinePatterns16Moves);
var threeLinePatterns = createPatterns(3);
console.assert(Object.keys(threeLinePatterns).length === 3);
var threeLinePatterns12Moves = threeLinePatterns[12];
var threeLinePatterns13Moves = threeLinePatterns[13];
var threeLinePatterns15Moves = threeLinePatterns[15];
var threeLinePatterns12And13Moves = threeLinePatterns12Moves.concat(threeLinePatterns13Moves);
var allThreeLinePatterns = threeLinePatterns12And13Moves.concat(threeLinePatterns15Moves);
var allTwoLinePatterns = (_a = []).concat.apply(_a, Object.values(createPatterns(2)));
var patternLibs = [
    { lines: 4, patterns: allFourLinePatterns, remainingMovesOffset: 2 },
    { lines: 4, patterns: allFourLinePatterns, remainingMovesOffset: 1 },
    { lines: 4, patterns: allFourLinePatterns, remainingMovesOffset: 0 },
    { lines: 3, patterns: allThreeLinePatterns, remainingMovesOffset: 1 },
    { lines: 3, patterns: allThreeLinePatterns, remainingMovesOffset: 0 },
    { lines: 2, patterns: allTwoLinePatterns, remainingMovesOffset: 1 },
    { lines: 2, patterns: allTwoLinePatterns, remainingMovesOffset: 0 },
];
var strategies = [
    {
        name: 'hottest cell in remaining patterns, then most complete',
        getNextMove: function (field, move, remainingMoves) {
            return getHottestCell(field, remainingMoves);
        },
        totalRounds: 0,
        fourLineWins: 0,
        threeLineWins: 0,
        twoLineWins: 0,
        oneLineWins: 0
    },
];

var field = new Field();
var LABEL_PREFIX = 'l';
var CHECKBOX_PREFIX = 'cb';
var SPAN_PREFIX = 's';
var CHECKBOX_STATES = {
    MARKED: 'marked',
    NEXT: 'next',
    BINGO: 'bingo',
    HEATMAP: 'heatmap',
    NONE: 'none',
};
var lastMarkedId = null;
var heatmapActive = false;
var lastUsedPatterns = 'None';
var lastUsedHeatmap = null;

function initWebsite() {
    var html = "\n    <main class=\"app\">\n        <div class=\"panel\">\n            <div class=\"bingo-board-container\">\n                <div class=\"bingo-headers\">\n                    <div class=\"header-letter\">B</div>\n                    <div class=\"header-letter\">I</div>\n                    <div class=\"header-letter\">N</div>\n                    <div class=\"header-letter\">G</div>\n                    <div class=\"header-letter\">O</div>\n                </div>\n                <div class=\"bingo-grid\">\n    ";
    
    for (var _i = 0, _a = field.cells; _i < _a.length; _i++) {
        var cell = _a[_i];
        var isCenterFreeCell = cell.id === 13;
        var freeTextHtml = isCenterFreeCell ? '<span class="cell-free-label">⭐ FREE</span>' : '';
        
        html += "\n        <label id=\"".concat(LABEL_PREFIX + cell.id, "\" class=\"grid-cell\" data-state=\"none\">\n            <div class=\"chip-overlay\"></div>\n            <span class=\"cell-number\">").concat(cell.id.toString().padStart(2, '0'), "</span>\n            ").concat(freeTextHtml, "\n            <input id=\"").concat(CHECKBOX_PREFIX + cell.id, "\" type=\"checkbox\" onClick=\"checkboxClicked(this, ").concat(cell.id, ")\">\n            <span id=\"").concat(SPAN_PREFIX + cell.id, "\" class=\"cell-info\"></span>\n        </label>\n        ");
    }
    
    html += "\n                </div>\n            </div>\n            <aside class=\"status\">\n                <div class=\"status-card\">\n                    <p class=\"status-row\">\n                        <span class=\"status-label\">Current move</span>\n                        <span id=\"move\" class=\"status-value\"></span>\n                    </p>\n                    <p class=\"status-row\">\n                        <span class=\"status-label\">Next step</span>\n                        <span id=\"message\" class=\"status-value\"></span>\n                    </p>\n                                    </div>\n                <button type=\"button\" class=\"reset-btn\" onclick=\"reset()\">RESET GAME</button>\n            </aside>\n        </div>\n    </main>\n    ";
    document.body.innerHTML = html;
    reset();
}

function toggleHeatmap(checkbox) {
    heatmapActive = checkbox.checked;
    if (heatmapActive) {
        drawHeatmap();
    }
    else {
        clearHeatmap();
    }
}

function clearHeatmap() {
    for (var _i = 0, _a = field.cells; _i < _a.length; _i++) {
        var cell = _a[_i];
        if (!cell.used && cell.id !== lastMarkedId) {
            setCheckboxState(cell.id, CHECKBOX_STATES.NONE);
        }
        setHeatmapInfo(cell.id, null);
    }
}

function drawHeatmap() {
    var heatmap = lastUsedHeatmap;
    if (!heatmap) {
        clearHeatmap();
        return;
    }
    var min = Math.min.apply(Math, heatmap);
    var max = Math.max.apply(Math, heatmap);
    for (var _i = 0, _a = field.cells; _i < _a.length; _i++) {
        var cell = _a[_i];
        setHeatmapInfo(cell.id, null);
        if (!cell.used) {
            if (cell.id !== lastMarkedId) {
                var colorShade = 100 - 100 * (heatmap[cell.id - 1] - min) / (max - min);
                setCheckboxState(cell.id, CHECKBOX_STATES.HEATMAP);
                setCheckboxColor(cell.id, "rgb(255, ".concat(100 + colorShade, ", ").concat(100 + colorShade, ")"));
            }
            setHeatmapInfo(cell.id, heatmap[cell.id - 1]);
        }
    }
}

function reset() {
    field.reset();
    for (var _i = 0, _a = field.cells; _i < _a.length; _i++) {
        var cell = _a[_i];
        var cb = document.getElementById(CHECKBOX_PREFIX + cell.id);
        if (cb) cb.checked = false;
        setCheckboxState(cell.id, CHECKBOX_STATES.NONE);
    }
    markNextMove();
    if (heatmapActive) {
        drawHeatmap();
    }
    displayMoveNumber(1);
    displayMessage('เลือก 13');
}

function checkboxClicked(checkbox, id) {
    if (!checkbox.checked) {
        checkbox.checked = true;
        return;
    }
    if (field.usedCellCount >= 16) {
        checkbox.checked = false;
        return;
    }
    var cell = field.cells[id - 1];
    cell.used = checkbox.checked;
    if (lastMarkedId) {
        setCheckboxState(lastMarkedId, CHECKBOX_STATES.NONE);
        lastMarkedId = null;
    }
    setCheckboxState(id, CHECKBOX_STATES.MARKED);
    for (var _i = 0, _a = cell.lines; _i < _a.length; _i++) {
        var line = _a[_i];
        if (line.isComplete) {
            for (var _b = 0, _c = line.cells; _b < _c.length; _b++) {
                var lineCell = _c[_b];
                setCheckboxState(lineCell.id, CHECKBOX_STATES.BINGO);
            }
        }
    }
    if (field.usedCellCount >= 16) {
        displayMessage('หมดแล้ว');
        return;
    }
    if (field.usedCellCount % 2 === 1) {
        displayMessage('เลือกตำแหน่งที่สุ่ม');
        clearHeatmap();
    }
    else {
        displayMessage('เลือกตำแหน่งของคุณ');
        markNextMove();
    }
    displayMoveNumber(field.usedCellCount + 1);
}

function markNextMove() {
    var nextId = getHottestCell(field, 16 - field.usedCellCount).id;
    setCheckboxState(nextId, CHECKBOX_STATES.NEXT);
    lastMarkedId = nextId;
    if (heatmapActive) {
        drawHeatmap();
    }
}

function setCheckboxColor(id, color) {
    var elem = document.getElementById(LABEL_PREFIX + id);
    if (elem) elem.style.backgroundColor = color;
}

function setCheckboxState(id, state) {
    var checkbox = document.getElementById(LABEL_PREFIX + id);
    if (!checkbox) return;
    if (checkbox.getAttribute('data-state') === CHECKBOX_STATES.HEATMAP) {
        setCheckboxColor(id, '');
    }
    checkbox.setAttribute('data-state', state);
}

function setHeatmapInfo(id, heat) {
    var elem = document.getElementById(SPAN_PREFIX + id);
    if (elem) elem.innerText = heat != null ? heat.toString() : '';
}

function displayMoveNumber(moveNumber) {
    var elem = document.getElementById('move');
    if (elem) elem.innerText = moveNumber + ' / 16';
}

function displayMessage(text) {
    var elem = document.getElementById('message');
    if (elem) elem.innerText = text;
}

window.addEventListener('DOMContentLoaded', initWebsite);