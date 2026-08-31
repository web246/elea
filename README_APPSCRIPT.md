Google Apps Script: Booking endpoint (send email + store in Sheet)

1) Create a Google Sheet to store bookings
- Create a new Google Sheet and name it e.g. "Elea Bookings".
- Rename the first sheet/tab to `Bookings` and add header row (timestamp, reference, services, rooms, areas, cleaningType, date, time, fullName, email, phone, address, postcode, notes)
- Copy the sheet ID from the URL (the long ID between `/d/` and `/edit`).

2) Create a new Google Apps Script project
- Open script.google.com and create a new project.
- Replace the default `Code.gs` with the script below.
- In the script set `SHEET_ID` to your Google Sheet ID.

Code (paste into Code.gs):

```javascript
const SHEET_ID = 'YOUR_SHEET_ID_HERE'; // set this

function doPost(e) {
  try {
    const payload = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName('Bookings') || ss.getSheets()[0];

    // ensure header row exists
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['timestamp','reference','services','rooms','areas','cleaningType','date','time','fullName','email','phone','address','postcode','notes']);
    }

    const now = new Date();
    const row = [
      now,
      payload.reference || '',
      Array.isArray(payload.services) ? payload.services.join(', ') : (payload.services || ''),
      payload.rooms || '',
      Array.isArray(payload.areas) ? payload.areas.join(', ') : (payload.areas || ''),
      payload.cleaningType || '',
      payload.date || '',
      payload.time || '',
      payload.details && payload.details.fullName ? payload.details.fullName : '',
      payload.details && payload.details.email ? payload.details.email : '',
      payload.details && payload.details.phone ? payload.details.phone : '',
      payload.details && payload.details.address ? payload.details.address : '',
      payload.details && payload.details.postcode ? payload.details.postcode : '',
      payload.details && payload.details.notes ? payload.details.notes : ''
    ];

    sheet.appendRow(row);

    // send confirmation email to customer (sent from the account that deploys the script)
    if (payload.details && payload.details.email) {
      const subject = `Elea booking confirmation — ${payload.reference || ''}`;
      const body = `Hello ${payload.details.fullName || ''},\n\nThank you for your booking request. We received the following details:\n\nReference: ${payload.reference || ''}\nServices: ${Array.isArray(payload.services) ? payload.services.join(', ') : payload.services}\nDate: ${payload.date || ''}\nTime: ${payload.time || ''}\nAddress: ${payload.details && payload.details.address ? payload.details.address : ''}\n\nWe will confirm availability shortly.\n\n— Elea`;
      GmailApp.sendEmail(payload.details.email, subject, body);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true, reference: payload.reference || '' })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // return bookings as JSON when called with ?action=list
  if (e && e.parameter && e.parameter.action === 'list') {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName('Bookings') || ss.getSheets()[0];
    const rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    const headers = rows[0];
    const data = rows.slice(1).map(r => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = r[i]; });
      // try to normalize date and details
      return {
        timestamp: obj.timestamp,
        reference: obj.reference,
        services: obj.services ? obj.services.split(',').map(s => s.trim()) : [],
        rooms: obj.rooms,
        areas: obj.areas ? obj.areas.split(',').map(s => s.trim()) : [],
        cleaningType: obj.cleaningType,
        date: obj.date,
        time: obj.time,
        details: { fullName: obj.fullName, email: obj.email, phone: obj.phone, address: obj.address, postcode: obj.postcode, notes: obj.notes }
      };
    });
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput('Elea Apps Script running');
}
```

3) Deploy as Web App
- Save the script and choose "Deploy" → "New deployment" → select "Web app".
- For "Who has access", choose "Anyone" or "Anyone with the link" depending on your needs. Note: allowing anonymous access means anyone can POST — protect the URL if needed.
- Copy the Web App URL.

4) Configure your site
- In `app.js`, set `defaults.bookingEndpoint = '<YOUR_WEB_APP_URL>'` (include full URL).
- Save and upload your site.

5) Test
- Open your site booking form, submit a test booking.
- The Apps Script will append the row to the Sheet and send a confirmation email from the Apps Script's owner account.
- The Admin calendar will fetch bookings from the endpoint at `<WEB_APP_URL>?action=list` and display them.

Security note
- This approach uses Google Apps Script + Gmail (your Google account) to send confirmations. Do not publish the Apps Script with edit access to untrusted users. Consider adding simple request validation (shared key) if you need to restrict who can POST.

Troubleshooting
- If you receive a 403 when sending emails, check Apps Script authorization and ensure the deploying account has Gmail and Spreadsheet access.
- If calendar doesn't show events, confirm `defaults.bookingEndpoint` is set and accessible from your admin page (CORS/public access).