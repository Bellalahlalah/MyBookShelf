const API_URL = '/api/books'; // URL ของ API ที่ใช้ดึงข้อมูลหนังสือ

async function loadBooks() {
  const res = await fetch(API_URL);
  const books = await res.json();
  const list = document.getElementById('book-list');
  list.innerHTML = '';

  books.forEach(book => {
    const div = document.createElement('div');
    div.className = 'book';

    div.innerHTML = `
      <div id="book-view-${book._id}">
        <strong>${book.title}</strong><br>
        ผู้แต่ง: ${book.author}<br>
        สถานะ: ${book.status}<br>
        ${book.image ? `<img src="${book.image}" alt="book image">` : ''}
        <button onclick="editBook('${book._id}', '${book.title}', '${book.author}', '${book.status}')">แก้ไข</button>
        <button onclick="deleteBook('${book._id}')">ลบ</button>
      </div>
      <div id="book-edit-${book._id}" style="display:none">
        <input type="text" id="edit-title-${book._id}" value="${book.title}"><br>
        <input type="text" id="edit-author-${book._id}" value="${book.author}"><br>
        <input type="text" id="edit-status-${book._id}" value="${book.status}"><br>
        <input type="file" id="edit-image-${book._id}"><br>
        <button onclick="saveEdit('${book._id}')">บันทึก</button>
        <button onclick="cancelEdit('${book._id}')">ยกเลิก</button>
      </div>
    `;

    list.appendChild(div);
  });
}

async function addBook() {
  const title = document.getElementById('title').value;
  const author = document.getElementById('author').value;
  const status = document.getElementById('status').value;
  const fileInput = document.getElementById('image');
  let image = '';

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    image = await toBase64(file);
  }

  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, author, status, image }) 
  });

  document.getElementById('title').value = '';
  document.getElementById('author').value = '';
  document.getElementById('status').value = '';
  fileInput.value = '';

  loadBooks(); // ← ใช้แค่นี้
}


async function deleteBook(id) {
  await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  loadBooks();
}

function editBook(id, title, author, status) {
  document.getElementById(`book-view-${id}`).style.display = 'none';
  document.getElementById(`book-edit-${id}`).style.display = 'block';
}

function cancelEdit(id) {
  document.getElementById(`book-edit-${id}`).style.display = 'none';
  document.getElementById(`book-view-${id}`).style.display = 'block';
}

async function saveEdit(id) {
  const title = document.getElementById(`edit-title-${id}`).value;
  const author = document.getElementById(`edit-author-${id}`).value;
  const status = document.getElementById(`edit-status-${id}`).value;

  const fileInput = document.getElementById(`edit-image-${id}`);
  let image = null;

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    image = await toBase64(file);
  }
  else {
    // ถ้าไม่มีการอัพโหลดรูปใหม่ ให้ใช้รูปเดิม
    const bookView = document.getElementById(`book-view-${id}`);
    const imgElement = bookView.querySelector('img');
    if (imgElement) {
      image = imgElement.src;
    }
  }

  await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, author, status, image })
  });

  loadBooks();

}

// แปลงรูปเป็น base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

// โหลดหนังสือทันทีเมื่อเปิดหน้าเว็บ
document.addEventListener('DOMContentLoaded', loadBooks);
