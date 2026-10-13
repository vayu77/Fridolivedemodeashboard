# Frido Live Demo Dashboard – Setup

## Setup (about 10 minutes)
1. Open each of the 3 Google Sheets and copy the ID from its URL (`/spreadsheets/d/<ID>/edit`).
2. Go to script.google.com > New project. Paste `Code.gs` into Code.gs. Add an HTML file named `Index` and paste `Index.html`.
3. In `CONFIG.SHEETS`, paste the three IDs. Set `tab` if data is not on the first tab, and `headerRow` if headers are not in row 1.
4. Run `getData` once from the editor. Click Review permissions > Allow (read access to your sheets). Check the Execution log: it shows the rows or a clear error naming the headers it found.
5. If your headers differ (e.g. "Caller" for agent), edit the regexes in `CONFIG.COLS`.

## Deploy and share
Deploy > New deployment > Web app. Execute as: **Me**. Who has access: **Anyone in your organisation** (or specific people).
Copy the web app URL and share it. Sheet IDs and permissions stay on the server; viewers never need sheet access.
After code edits: Deploy > Manage deployments > Edit > New version.

## Test checklist
- [ ] Add a demo row in each sheet: after Refresh (or within 3 min) the Today KPI rises by 1 for that department.
- [ ] Today total = Mobility + Furniture + Non-Furniture.
- [ ] Duplicate a row with the same ID (or same agent/date/customer): count does not change.
- [ ] Row with a non-completed status (cancelled/pending): not counted.
- [ ] Row with invalid date or blank agent: not counted; yellow notice shows the skipped count.
- [ ] Agent filter: KPIs, pie, trend, tables all change; counts match a manual filter in the sheet.
- [ ] Yesterday / 7 / 30 days / Custom range match manual counts (dates are IST, dd/mm/yyyy).
- [ ] Pie tooltip shows count and percentage; percentages add to 100.
- [ ] Department tables: sort by agent, demos, date; pagination; "Show individual records" row count equals the demos total.
- [ ] Empty sheet or wrong ID: other departments still load, error names the failing one.
- [ ] Layout is fine at laptop and tablet widths.
