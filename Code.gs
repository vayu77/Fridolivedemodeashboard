/** FRIDO LIVE VIDEO CALL DEMO DASHBOARD - Google Apps Script backend **/
const CONFIG = {
  TZ: 'Asia/Kolkata',
  // Paste the ID from each sheet URL: docs.google.com/spreadsheets/d/<ID>/edit
  // tab = exact tab name; leave '' to use the first tab. headerRow = row holding column titles.
  SHEETS: {
    'Mobility':      { id: 'PASTE_MOBILITY_SHEET_ID',      tab: '', headerRow: 1 },
    'Furniture':     { id: 'PASTE_FURNITURE_SHEET_ID',     tab: '', headerRow: 1 },
    'Non-Furniture': { id: 'PASTE_NON_FURNITURE_SHEET_ID', tab: '', headerRow: 1 }
  },
  // Header matching (case-insensitive regex). Edit if your column names differ.
  COLS: {
    agent:    /agent|executive|caller|handled|demo\s*by|done\s*by|sales\s*person|\bname\b/i,
    date:     /date|day/i,
    status:   /status|outcome/i,
    id:       /\bid\b|ticket|record|order|lead/i,
    customer: /customer|client|patient/i
  },
  COUNT_AS_DONE: /complet|done|conduct|success|attend|yes/i,
  NOT_DONE: /not|cancel|no.?show|pending|resched|missed|fail|declin/i
};

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index').setTitle('Frido Demo Dashboard')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function pickCol(headers, re, skip) {
  for (let i = 0; i < headers.length; i++) if (!skip.includes(i) && re.test(headers[i])) return i;
  return -1;
}

function toIso(v) {
  if (v instanceof Date && !isNaN(v)) return Utilities.formatDate(v, CONFIG.TZ, 'yyyy-MM-dd');
  const s = String(v || '').trim(); let m;
  if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) return m[1] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[3]).slice(-2);
  if ((m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/))) { // dd/mm/yyyy (India)
    const y = m[3].length == 2 ? '20' + m[3] : m[3];
    if (+m[2] < 1 || +m[2] > 12) return null;
    return y + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2);
  }
  const d = new Date(s); return isNaN(d) ? null : Utilities.formatDate(d, CONFIG.TZ, 'yyyy-MM-dd');
}

function getData() {
  const rows = [], errors = [], seen = {}; let skipped = 0;
  Object.keys(CONFIG.SHEETS).forEach(function (dept) {
    try {
      const c = CONFIG.SHEETS[dept];
      if (/^PASTE_/.test(c.id)) throw new Error('Sheet ID not configured');
      const ss = SpreadsheetApp.openById(c.id);
      const sh = c.tab ? ss.getSheetByName(c.tab) : ss.getSheets()[0];
      if (!sh) throw new Error('Tab "' + c.tab + '" not found');
      const v = sh.getDataRange().getValues();
      if (v.length <= c.headerRow) return; // empty sheet
      const h = v[c.headerRow - 1].map(String), used = [];
      const ix = {};
      ['agent', 'date', 'status', 'id', 'customer'].forEach(function (k) {
        ix[k] = pickCol(h, CONFIG.COLS[k], used); if (ix[k] >= 0) used.push(ix[k]);
      });
      if (ix.agent < 0 || ix.date < 0) throw new Error('Could not find Agent/Date columns. Headers: ' + h.join(' | '));
      for (let r = c.headerRow; r < v.length; r++) {
        const row = v[r], agent = String(row[ix.agent] || '').trim(), dt = toIso(row[ix.date]);
        if (!agent && !row[ix.date]) continue; // blank row
        if (!agent || !dt) { skipped++; continue; }
        if (ix.status >= 0) {
          const st = String(row[ix.status] || '');
          if (!CONFIG.COUNT_AS_DONE.test(st) || CONFIG.NOT_DONE.test(st)) continue;
        }
        const cust = ix.customer >= 0 ? String(row[ix.customer] || '').trim() : '';
        const rid = ix.id >= 0 ? String(row[ix.id] || '').trim() : '';
        const key = rid ? dept + '|id|' + rid : (cust ? dept + '|' + agent + '|' + dt + '|' + cust : dept + '|row|' + r);
        if (seen[key]) continue; seen[key] = 1;
        rows.push({ d: dept, a: agent, dt: dt, c: cust });
      }
    } catch (e) { errors.push(dept + ': ' + e.message); }
  });
  return { rows: rows, errors: errors, skipped: skipped,
    updated: Utilities.formatDate(new Date(), CONFIG.TZ, 'dd MMM yyyy, hh:mm:ss a') + ' IST' };
}
