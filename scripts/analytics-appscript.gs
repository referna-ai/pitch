// Google Apps Script — pitch analytics webhook
// Deploy as: Web App → Execute as Me → Anyone
// Paste into: https://script.google.com → New project → Code.gs
//
// No hardcoded slide list — columns are created automatically when new slides appear.

var SHEET_ID = '1ndMM3HdLha7j51pbxHutavdpR0i-OlBSURNpuS15PK8';

var FIXED_HEADERS = ['Date', 'Viewer', 'Total (s)', 'Session ID'];
var FIXED_COUNT   = FIXED_HEADERS.length;

function doPost(e) {
  try {
    var sheet   = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    var data    = JSON.parse(e.postData.contents);
    var s       = data.session || data;
    var slides  = (s.slides || []).slice().sort(function(a, b) {
      return (a.name || a.file) < (b.name || b.file) ? -1 : 1;
    });

    // ── Ensure header row ────────────────────────────────────────────────
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(FIXED_HEADERS);
      sheet.getRange(1, 1, 1, FIXED_HEADERS.length).setFontWeight('bold');
    }

    // ── Read existing headers, auto-add missing slide columns ────────────
    var headerRange  = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    var headers      = headerRange.getValues()[0];

    slides.forEach(function(rec) {
      var colName = rec.name || rec.file;
      if (headers.indexOf(colName) === -1) {
        headers.push(colName);
        var col = headers.length;
        sheet.getRange(1, col).setValue(colName).setFontWeight('bold');
        sheet.getRange(1, col).setNumberFormat('@'); // text
      }
    });

    // ── Build row ────────────────────────────────────────────────────────
    var total = slides.reduce(function(a, r) { return a + (r.duration || 0); }, 0);
    var row   = [new Date(s.startedAt), s.viewer || 'Anonymous', total, s.id];

    // Fill slide columns (only the ones that exist for this session)
    for (var c = FIXED_COUNT; c < headers.length; c++) {
      var colName = headers[c];
      var rec = slides.find(function(r) { return (r.name || r.file) === colName; });
      row.push(rec ? (rec.duration || 0) : 0);
    }

    // ── Upsert by session ID ─────────────────────────────────────────────
    var lastRow   = sheet.getLastRow();
    var targetRow = -1;
    if (lastRow > 1) {
      var ids = sheet.getRange(2, 4, lastRow - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) {
        if (ids[i][0] === s.id) { targetRow = i + 2; break; }
      }
    }

    if (targetRow > 0) {
      // Extend existing row if new columns were added
      sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
      targetRow = sheet.getLastRow();
    }

    // Number formats
    sheet.getRange(targetRow, 3, 1, 1).setNumberFormat('0');
    if (row.length > FIXED_COUNT) {
      sheet.getRange(targetRow, FIXED_COUNT + 1, 1, row.length - FIXED_COUNT).setNumberFormat('0');
    }

  } catch(err) {
    Logger.log(err.toString());
  }
  return ContentService.createTextOutput('OK');
}
