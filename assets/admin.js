const BACKEND_BASE = 'http://localhost:4001';
async function fetchJson(path) {
  const url = path.startsWith('http') ? path : (path.startsWith('/') ? `${BACKEND_BASE}${path}` : `${BACKEND_BASE}/${path}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Fetch failed: ' + res.statusText);
  return res.json();
}

function renderBookings(bookings) {
  const container = document.getElementById('bookings');
  if (!bookings || bookings.length === 0) {
    container.innerHTML = '<p>No bookings yet.</p>';
    return;
  }

  const list = document.createElement('div');
  list.className = 'booking-list';

  bookings.forEach(b => {
    const card = document.createElement('div');
    card.className = 'booking-card';
    card.innerHTML = `
      <h3>${b.reference_code} — ${b.customer_name}</h3>
      <p><strong>Email:</strong> ${b.customer_email} — <strong>Phone:</strong> ${b.customer_phone}</p>
      <p><strong>Services:</strong> ${Array.isArray(b.service_types) ? b.service_types.join(', ') : b.service_types}</p>
      <p><strong>Date:</strong> ${b.preferred_date || ''} <strong>Time:</strong> ${b.preferred_time || ''}</p>
      <p><strong>Notes:</strong> ${b.notes || ''}</p>
      <div class="booking-images"></div>
    `;

    const imagesDiv = card.querySelector('.booking-images');
    const imgs = (b.booking_images || []).map(i => i.url || i.storage_path || null).filter(Boolean);
    imgs.forEach(u => {
      const a = document.createElement('a');
      a.href = u;
      a.target = '_blank';
      const img = document.createElement('img');
      img.src = u;
      img.style.maxWidth = '200px';
      img.style.height = 'auto';
      img.style.marginRight = '8px';
      a.appendChild(img);
      imagesDiv.appendChild(a);
    });

    list.appendChild(card);
  });

  container.innerHTML = '';
  container.appendChild(list);
}

function renderCustomers(customers) {
  const container = document.getElementById('customers');
  if (!customers || customers.length === 0) {
    container.innerHTML = '<p>No customers yet.</p>';
    return;
  }

  const table = document.createElement('table');
  table.border = '1';
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>Name</th><th>Email</th><th>Phone</th><th>First Seen</th></tr>';
  table.appendChild(thead);
  const tbody = document.createElement('tbody');

  customers.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${c.customer_name}</td><td>${c.customer_email}</td><td>${c.customer_phone}</td><td>${new Date(c.created_at).toLocaleString()}</td>`;
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.innerHTML = '';
  container.appendChild(table);
}

function renderUsers(users) {
  const container = document.getElementById('users');
  if (!users || users.length === 0) {
    container.innerHTML = '<p>No users found.</p>';
    return;
  }

  const table = document.createElement('table');
  table.border = '1';
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>ID</th><th>Email</th><th>Phone</th><th>Created</th></tr>';
  table.appendChild(thead);
  const tbody = document.createElement('tbody');

  users.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${u.id}</td><td>${u.email || ''}</td><td>${u.phone || ''}</td><td>${u.created_at ? new Date(u.created_at).toLocaleString() : ''}</td>`;
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.innerHTML = '';
  container.appendChild(table);
}

function renderUploads(uploads) {
  const container = document.getElementById('uploads');
  if (!uploads || uploads.length === 0) {
    container.innerHTML = '<p>No uploaded files found.</p>';
    return;
  }

  const list = document.createElement('div');
  list.className = 'upload-list';

  uploads.forEach(f => {
    const item = document.createElement('div');
    item.style.marginBottom = '12px';
    const name = document.createElement('div');
    name.textContent = f.name;
    item.appendChild(name);
    if (f.publicUrl) {
      const a = document.createElement('a');
      a.href = f.publicUrl;
      a.target = '_blank';
      const img = document.createElement('img');
      img.src = f.publicUrl;
      img.style.maxWidth = '200px';
      img.style.height = 'auto';
      img.style.display = 'block';
      img.style.marginTop = '6px';
      a.appendChild(img);
      item.appendChild(a);
    }
    list.appendChild(item);
  });

  container.innerHTML = '';
  container.appendChild(list);
}

async function loadAdmin() {
  try {
    const bookingsResp = await fetchJson('/api/admin/bookings');
    if (bookingsResp.ok) renderBookings(bookingsResp.bookings);

    const customersResp = await fetchJson('/api/admin/customers');
    if (customersResp.ok) renderCustomers(customersResp.customers);
    const usersResp = await fetchJson('/api/admin/users');
    if (usersResp.ok) renderUsers(usersResp.users);
    const uploadsResp = await fetchJson('/api/admin/uploads');
    if (uploadsResp.ok) renderUploads(uploadsResp.uploads);
  } catch (err) {
    console.error(err);
    document.getElementById('bookings').innerText = 'Failed to load admin data: ' + err.message;
  }
}

window.addEventListener('load', loadAdmin);
