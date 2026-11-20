/**
 * NEONEX lead capture — Google Apps Script (bound to a Google Sheet)
 *
 * Receives form submissions from the website (AI Audit booking + project brief),
 * appends each one as a row in the "Leads" sheet, and emails you a notification.
 *
 * Setup:
 *   1. Create a new Google Sheet.
 *   2. Extensions > Apps Script. Delete the sample code, paste this whole file, Save.
 *   3. Run `testSetup` once (select it in the toolbar, click Run) and allow the permissions.
 *      You should get a test row in the sheet and a test email.
 *   4. Deploy > New deployment > type "Web app"
 *        Execute as: Me
 *        Who has access: Anyone
 *      Copy the Web app URL (https://script.google.com/macros/s/.../exec).
 */

const SHEET_NAME = 'Leads';
const NOTIFY_EMAIL = ''; // leave empty to send to the Google account that owns this script

const HEADERS = ['เวลา', 'ประเภท', 'ชื่อ', 'ช่องทางติดต่อ', 'ประเภทธุรกิจ', 'งบประมาณ',
                 'รายละเอียด / ปัญหา', 'ราคาประเมิน', 'วันประเมิน', 'สรุปทั้งหมด'];

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (data.website) return json_({ ok: true }); // honeypot field filled = bot

    const type = data.type === 'AUDIT_BOOKING' ? 'AI Audit' : 'ประเมินราคา';
    const row = [
      new Date(), type,
      clip_(data.name), clip_(data.contact), clip_(data.business), clip_(data.budget),
      clip_(data.bottleneck || data.notes),
      data.totalPrice || '', data.totalDays || '',
      clip_(data.blueprint, 5000),
    ];
    if (!row[2] && !row[3]) return json_({ ok: false, error: 'empty' });

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try { sheet_().appendRow(row); } finally { lock.releaseLock(); }

    notify_(type, row);
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json_({ ok: true, service: 'neonex-leads' });
}

/** Run once from the editor to grant permissions and check that the sheet + email work. */
function testSetup() {
  const res = doPost({ postData: { contents: JSON.stringify({
    type: 'AUDIT_BOOKING', name: 'ทดสอบระบบ', contact: 'test', business: 'ทดสอบ',
    budget: '-', bottleneck: 'แถวทดสอบ ลบทิ้งได้',
  }) } });
  const out = JSON.parse(res.getContent());
  if (!out.ok) throw new Error('ไม่สำเร็จ: ' + out.error);
  console.log('สำเร็จ! เปิดชีตได้ที่: ' + ss_().getUrl());
}

// Works whether the script was opened from a Sheet (Extensions > Apps Script)
// or created on its own at script.google.com (then it makes a "NEONEX Leads" sheet).
function ss_() {
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('SHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  const created = SpreadsheetApp.create('NEONEX Leads');
  props.setProperty('SHEET_ID', created.getId());
  return created;
}

function sheet_() {
  const ss = ss_();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sh;
}

function notify_(type, row) {
  const to = NOTIFY_EMAIL || Session.getEffectiveUser().getEmail();
  const lines = HEADERS.map((h, i) => `${h}: ${row[i] === '' ? '-' : row[i]}`);
  MailApp.sendEmail({
    to: to,
    subject: `[NEONEX] ลูกค้าใหม่ (${type}): ${row[2] || '-'} — ${row[3] || '-'}`,
    body: lines.join('\n') + '\n\nเปิดชีต: ' + ss_().getUrl(),
  });
}

// Trim length and neutralise spreadsheet formulas (=, +, -, @) from user input.
function clip_(v, max) {
  let s = v == null ? '' : String(v).slice(0, max || 1000);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
