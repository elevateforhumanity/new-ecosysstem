/**
 * Spreadsheet Service (Google Sheets Alternative)
 * Provides spreadsheet creation, editing, and formula calculation
 */

class SpreadsheetService {
  constructor() {
    this.spreadsheets = new Map();
    this.sheets = new Map();
    this.cells = new Map();
    this.formulas = new Map();
  }

  /**
   * Create new spreadsheet
   */
  async createSpreadsheet({ title, ownerId, template = null }) {
    const spreadsheetId = `sheet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const spreadsheet = {
      id: spreadsheetId,
      title,
      ownerId,
      sheets: [],
      collaborators: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Create default sheet
    const defaultSheet = await this.createSheet(spreadsheetId, 'Sheet1');
    spreadsheet.sheets.push(defaultSheet.id);
    
    this.spreadsheets.set(spreadsheetId, spreadsheet);
    
    return spreadsheet;
  }

  /**
   * Create new sheet within spreadsheet
   */
  async createSheet(spreadsheetId, name, rows = 100, cols = 26) {
    const sheetId = `sheetdata_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const sheet = {
      id: sheetId,
      spreadsheetId,
      name,
      rows,
      cols,
      cells: {},
      frozenRows: 0,
      frozenCols: 0,
      hiddenRows: [],
      hiddenCols: [],
      columnWidths: {},
      rowHeights: {},
      createdAt: new Date()
    };
    
    this.sheets.set(sheetId, sheet);
    
    return sheet;
  }

  /**
   * Update cell value
   */
  async updateCell(sheetId, row, col, value, formula = null) {
    const sheet = this.sheets.get(sheetId);
    if (!sheet) throw new Error('Sheet not found');
    
    const cellKey = `${row},${col}`;
    
    const cell = {
      row,
      col,
      value,
      formula,
      displayValue: value,
      format: {
        bold: false,
        italic: false,
        underline: false,
        fontSize: 10,
        fontFamily: 'Arial',
        color: '#000000',
        backgroundColor: '#ffffff',
        align: 'left',
        verticalAlign: 'middle'
      },
      updatedAt: new Date()
    };
    
    // If formula, calculate value
    if (formula) {
      cell.displayValue = await this.calculateFormula(sheetId, formula);
    }
    
    sheet.cells[cellKey] = cell;
    
    // Recalculate dependent cells
    await this.recalculateDependents(sheetId, row, col);
    
    return cell;
  }

  /**
   * Calculate formula
   */
  async calculateFormula(sheetId, formula) {
    try {
      // Remove leading =
      const expr = formula.startsWith('=') ? formula.substring(1) : formula;
      
      // Handle common functions
      if (expr.startsWith('SUM(')) {
        return this.calculateSum(sheetId, expr);
      } else if (expr.startsWith('AVERAGE(')) {
        return this.calculateAverage(sheetId, expr);
      } else if (expr.startsWith('COUNT(')) {
        return this.calculateCount(sheetId, expr);
      } else if (expr.startsWith('IF(')) {
        return this.calculateIf(sheetId, expr);
      }
      
      // Simple arithmetic
      return eval(expr);
    } catch (error) {
      return '#ERROR!';
    }
  }

  /**
   * Calculate SUM function
   */
  calculateSum(sheetId, expr) {
    const range = this.parseRange(expr.match(/SUM\((.*?)\)/)[1]);
    const values = this.getRangeValues(sheetId, range);
    return values.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  }

  /**
   * Calculate AVERAGE function
   */
  calculateAverage(sheetId, expr) {
    const range = this.parseRange(expr.match(/AVERAGE\((.*?)\)/)[1]);
    const values = this.getRangeValues(sheetId, range);
    const sum = values.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    return sum / values.length;
  }

  /**
   * Calculate COUNT function
   */
  calculateCount(sheetId, expr) {
    const range = this.parseRange(expr.match(/COUNT\((.*?)\)/)[1]);
    const values = this.getRangeValues(sheetId, range);
    return values.filter(val => !isNaN(parseFloat(val))).length;
  }

  /**
   * Calculate IF function
   */
  calculateIf(sheetId, expr) {
    const match = expr.match(/IF\((.*?),(.*?),(.*?)\)/);
    if (!match) return '#ERROR!';
    
    const [, condition, trueVal, falseVal] = match;
    return eval(condition) ? trueVal : falseVal;
  }

  /**
   * Parse range (e.g., "A1:B10")
   */
  parseRange(rangeStr) {
    const [start, end] = rangeStr.split(':');
    const startCell = this.parseCellRef(start);
    const endCell = end ? this.parseCellRef(end) : startCell;
    
    return {
      startRow: startCell.row,
      startCol: startCell.col,
      endRow: endCell.row,
      endCol: endCell.col
    };
  }

  /**
   * Parse cell reference (e.g., "A1" -> {row: 0, col: 0})
   */
  parseCellRef(cellRef) {
    const match = cellRef.match(/([A-Z]+)(\d+)/);
    if (!match) return { row: 0, col: 0 };
    
    const [, colStr, rowStr] = match;
    const col = this.columnToIndex(colStr);
    const row = parseInt(rowStr) - 1;
    
    return { row, col };
  }

  /**
   * Convert column letter to index (A=0, B=1, etc.)
   */
  columnToIndex(col) {
    let index = 0;
    for (let i = 0; i < col.length; i++) {
      index = index * 26 + (col.charCodeAt(i) - 64);
    }
    return index - 1;
  }

  /**
   * Convert index to column letter (0=A, 1=B, etc.)
   */
  indexToColumn(index) {
    let col = '';
    index++;
    while (index > 0) {
      const remainder = (index - 1) % 26;
      col = String.fromCharCode(65 + remainder) + col;
      index = Math.floor((index - 1) / 26);
    }
    return col;
  }

  /**
   * Get values from range
   */
  getRangeValues(sheetId, range) {
    const sheet = this.sheets.get(sheetId);
    if (!sheet) return [];
    
    const values = [];
    
    for (let row = range.startRow; row <= range.endRow; row++) {
      for (let col = range.startCol; col <= range.endCol; col++) {
        const cellKey = `${row},${col}`;
        const cell = sheet.cells[cellKey];
        if (cell) {
          values.push(cell.value);
        }
      }
    }
    
    return values;
  }

  /**
   * Recalculate dependent cells
   */
  async recalculateDependents(sheetId, row, col) {
    const sheet = this.sheets.get(sheetId);
    if (!sheet) return;
    
    // Find cells that reference this cell
    const cellRef = `${this.indexToColumn(col)}${row + 1}`;
    
    for (const [key, cell] of Object.entries(sheet.cells)) {
      if (cell.formula && cell.formula.includes(cellRef)) {
        cell.displayValue = await this.calculateFormula(sheetId, cell.formula);
      }
    }
  }

  /**
   * Format cell
   */
  async formatCell(sheetId, row, col, format) {
    const sheet = this.sheets.get(sheetId);
    if (!sheet) throw new Error('Sheet not found');
    
    const cellKey = `${row},${col}`;
    const cell = sheet.cells[cellKey] || { row, col, value: '', displayValue: '' };
    
    cell.format = { ...cell.format, ...format };
    sheet.cells[cellKey] = cell;
    
    return cell;
  }

  /**
   * Insert row
   */
  async insertRow(sheetId, rowIndex) {
    const sheet = this.sheets.get(sheetId);
    if (!sheet) throw new Error('Sheet not found');
    
    // Shift all rows down
    const newCells = {};
    for (const [key, cell] of Object.entries(sheet.cells)) {
      if (cell.row >= rowIndex) {
        const newKey = `${cell.row + 1},${cell.col}`;
        newCells[newKey] = { ...cell, row: cell.row + 1 };
      } else {
        newCells[key] = cell;
      }
    }
    
    sheet.cells = newCells;
    sheet.rows++;
    
    return sheet;
  }

  /**
   * Insert column
   */
  async insertColumn(sheetId, colIndex) {
    const sheet = this.sheets.get(sheetId);
    if (!sheet) throw new Error('Sheet not found');
    
    // Shift all columns right
    const newCells = {};
    for (const [key, cell] of Object.entries(sheet.cells)) {
      if (cell.col >= colIndex) {
        const newKey = `${cell.row},${cell.col + 1}`;
        newCells[newKey] = { ...cell, col: cell.col + 1 };
      } else {
        newCells[key] = cell;
      }
    }
    
    sheet.cells = newCells;
    sheet.cols++;
    
    return sheet;
  }

  /**
   * Create chart
   */
  async createChart(sheetId, chartConfig) {
    const chartId = `chart_${Date.now()}`;
    
    const chart = {
      id: chartId,
      sheetId,
      type: chartConfig.type, // line, bar, pie, scatter
      dataRange: chartConfig.dataRange,
      title: chartConfig.title,
      xAxis: chartConfig.xAxis,
      yAxis: chartConfig.yAxis,
      position: chartConfig.position,
      createdAt: new Date()
    };
    
    return chart;
  }

  /**
   * Export to CSV
   */
  async exportToCSV(sheetId) {
    const sheet = this.sheets.get(sheetId);
    if (!sheet) throw new Error('Sheet not found');
    
    let csv = '';
    
    for (let row = 0; row < sheet.rows; row++) {
      const rowData = [];
      for (let col = 0; col < sheet.cols; col++) {
        const cellKey = `${row},${col}`;
        const cell = sheet.cells[cellKey];
        rowData.push(cell ? `"${cell.displayValue}"` : '');
      }
      csv += rowData.join(',') + '\n';
    }
    
    return csv;
  }

  /**
   * Import from CSV
   */
  async importFromCSV(spreadsheetId, csvData) {
    const lines = csvData.split('\n');
    const sheetId = await this.createSheet(spreadsheetId, 'Imported', lines.length, 26);
    
    lines.forEach((line, row) => {
      const values = line.split(',');
      values.forEach((value, col) => {
        this.updateCell(sheetId.id, row, col, value.replace(/"/g, ''));
      });
    });
    
    return sheetId;
  }

  /**
   * Get spreadsheet data
   */
  async getSpreadsheet(spreadsheetId) {
    const spreadsheet = this.spreadsheets.get(spreadsheetId);
    if (!spreadsheet) throw new Error('Spreadsheet not found');
    
    const sheetsData = [];
    for (const sheetId of spreadsheet.sheets) {
      const sheet = this.sheets.get(sheetId);
      if (sheet) {
        sheetsData.push(sheet);
      }
    }
    
    return {
      ...spreadsheet,
      sheetsData
    };
  }
}

module.exports = new SpreadsheetService();
