import React, { useState, useEffect } from 'react';

/**
 * Sheets Page - Google Sheets Alternative
 */
export function Sheets() {
  const [spreadsheet, setSpreadsheet] = useState(null);
  const [activeSheet, setActiveSheet] = useState(null);
  const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 });
  const [cellValue, setCellValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadSpreadsheet();
  }, []);

  const loadSpreadsheet = async () => {
    // Mock data for demo
    const mockSpreadsheet = {
      id: 'sheet_1',
      title: 'Untitled Spreadsheet',
      sheets: ['sheet1'],
      sheetsData: [{
        id: 'sheet1',
        name: 'Sheet1',
        rows: 100,
        cols: 26,
        cells: {}
      }]
    };
    
    setSpreadsheet(mockSpreadsheet);
    setActiveSheet(mockSpreadsheet.sheetsData[0]);
  };

  const handleCellClick = (row, col) => {
    setSelectedCell({ row, col });
    const cellKey = `${row},${col}`;
    const cell = activeSheet?.cells[cellKey];
    setCellValue(cell?.formula || cell?.value || '');
    setIsEditing(false);
  };

  const handleCellDoubleClick = (row, col) => {
    setSelectedCell({ row, col });
    const cellKey = `${row},${col}`;
    const cell = activeSheet?.cells[cellKey];
    setCellValue(cell?.formula || cell?.value || '');
    setIsEditing(true);
  };

  const handleCellChange = (e) => {
    setCellValue(e.target.value);
  };

  const handleCellSubmit = async () => {
    if (!activeSheet) return;
    
    const cellKey = `${selectedCell.row},${selectedCell.col}`;
    const isFormula = cellValue.startsWith('=');
    
    // Update cell
    const newCell = {
      row: selectedCell.row,
      col: selectedCell.col,
      value: cellValue,
      formula: isFormula ? cellValue : null,
      displayValue: cellValue
    };
    
    activeSheet.cells[cellKey] = newCell;
    setIsEditing(false);
    
    // In production, save to backend
    console.log('Cell updated:', newCell);
  };

  const columnToLetter = (col) => {
    let letter = '';
    let num = col + 1;
    while (num > 0) {
      const remainder = (num - 1) % 26;
      letter = String.fromCharCode(65 + remainder) + letter;
      num = Math.floor((num - 1) / 26);
    }
    return letter;
  };

  const getCellValue = (row, col) => {
    const cellKey = `${row},${col}`;
    const cell = activeSheet?.cells[cellKey];
    return cell?.displayValue || '';
  };

  const isCellSelected = (row, col) => {
    return selectedCell.row === row && selectedCell.col === col;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Toolbar */}
      <div style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '0.75rem 1rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center'
      }}>
        <input
          type="text"
          value={spreadsheet?.title || 'Untitled Spreadsheet'}
          style={{
            border: 'none',
            fontSize: '1.125rem',
            fontWeight: '500',
            outline: 'none',
            width: '300px'
          }}
        />

        <div style={{ flex: 1 }} />

        <button style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#fff',
          border: '1px solid #d1d5db',
          borderRadius: '0.375rem',
          cursor: 'pointer'
        }}>
          💾 Save
        </button>

        <button style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#3b82f6',
          color: '#fff',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer'
        }}>
          Share
        </button>
      </div>

      {/* Formula bar */}
      <div style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '0.5rem 1rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center'
      }}>
        <div style={{
          padding: '0.5rem',
          backgroundColor: '#f3f4f6',
          borderRadius: '0.25rem',
          minWidth: '60px',
          textAlign: 'center',
          fontWeight: '600'
        }}>
          {columnToLetter(selectedCell.col)}{selectedCell.row + 1}
        </div>

        <input
          type="text"
          value={cellValue}
          onChange={handleCellChange}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleCellSubmit();
          }}
          placeholder="Enter value or formula (=SUM(A1:A10))"
          style={{
            flex: 1,
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '0.875rem'
          }}
        />
      </div>

      {/* Spreadsheet grid */}
      <div style={{ flex: 1, overflow: 'auto', backgroundColor: '#fff' }}>
        <table style={{
          borderCollapse: 'collapse',
          width: '100%',
          tableLayout: 'fixed'
        }}>
          <thead>
            <tr>
              <th style={{
                width: '40px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                position: 'sticky',
                top: 0,
                left: 0,
                zIndex: 3
              }} />
              {Array.from({ length: activeSheet?.cols || 26 }, (_, col) => (
                <th
                  key={col}
                  style={{
                    width: '100px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    padding: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    position: 'sticky',
                    top: 0,
                    zIndex: 2
                  }}
                >
                  {columnToLetter(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: activeSheet?.rows || 100 }, (_, row) => (
              <tr key={row}>
                <td style={{
                  width: '40px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  padding: '0.5rem',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  position: 'sticky',
                  left: 0,
                  zIndex: 1
                }}>
                  {row + 1}
                </td>
                {Array.from({ length: activeSheet?.cols || 26 }, (_, col) => (
                  <td
                    key={col}
                    onClick={() => handleCellClick(row, col)}
                    onDoubleClick={() => handleCellDoubleClick(row, col)}
                    style={{
                      border: '1px solid #e5e7eb',
                      padding: '0.5rem',
                      cursor: 'cell',
                      backgroundColor: isCellSelected(row, col) ? '#dbeafe' : '#fff',
                      outline: isCellSelected(row, col) ? '2px solid #3b82f6' : 'none',
                      position: 'relative'
                    }}
                  >
                    {isEditing && isCellSelected(row, col) ? (
                      <input
                        type="text"
                        value={cellValue}
                        onChange={handleCellChange}
                        onBlur={handleCellSubmit}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleCellSubmit();
                        }}
                        autoFocus
                        style={{
                          width: '100%',
                          border: 'none',
                          outline: 'none',
                          padding: 0,
                          backgroundColor: 'transparent'
                        }}
                      />
                    ) : (
                      getCellValue(row, col)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sheet tabs */}
      <div style={{
        backgroundColor: '#fff',
        borderTop: '1px solid #e5e7eb',
        padding: '0.5rem 1rem',
        display: 'flex',
        gap: '0.5rem'
      }}>
        {spreadsheet?.sheetsData?.map((sheet) => (
          <button
            key={sheet.id}
            onClick={() => setActiveSheet(sheet)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: activeSheet?.id === sheet.id ? '#e0e7ff' : 'transparent',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: activeSheet?.id === sheet.id ? '600' : '400'
            }}
          >
            {sheet.name}
          </button>
        ))}
        <button style={{
          padding: '0.5rem 1rem',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.25rem'
        }}>
          +
        </button>
      </div>
    </div>
  );
}

export default Sheets;
