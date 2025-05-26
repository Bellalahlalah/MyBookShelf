//Backend API (Node.js) รับคำสั่งจาก frontend (เพิ่ม/ลบ/อ่านหนังสือ/แก้ไข) แล้วจัดการกับ MongoDB
const express = require('express');
const mongoose = require('mongoose'); // เชื่อมต่อ MongoDB 
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const DB_book = require('./DB_book');// เชื่อมต่อ MongoDB Atlas


const app = express();
const PORT = 3000;
// Middleware
app.use(cors());
app.use(bodyParser.json());

// Route เริ่มต้น
app.get('/', (req, res) => {
  res.send('Welcome to Book Log API!');
});
// GET /books
app.get('/api/books', async (req, res) => {
  try {
    const books = await DB_book.find(); // ดึงหนังสือทั้งหมด
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// POST /books
app.post('/api/books', async (req, res) => {
  const { title, author, status, image } = req.body;
  try {
    const newBook = new DB_book({ title, author, status, image });
    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add book' });
  }
});

// PUT /books/:id คือการ อัพเดต
app.put('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  const { title, author, status, image } = req.body;

  try {
    const updatedBook = await DB_book.findByIdAndUpdate(
      id,
      { title, author, status, image },
      { new: true }
    );
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// DELETE /books/:id
app.delete('/api/books/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await DB_book.findByIdAndDelete(id);
    res.json({ message: 'Book deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

// เชื่อมต่อ MongoDB
mongoose.connect('mongodb+srv://bellnkb:bellmongo@cluster0.ujimc54.mongodb.net/bookdb?retryWrites=true&w=majority')
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
