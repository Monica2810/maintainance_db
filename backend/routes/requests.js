const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// CREATE a request (student)
router.post('/', auth, upload.single('image'), async (req, res) => {
  const { title, description, location, urgency } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (!title || !description || !location || !urgency) {
    return res.status(400).json({ message: 'All request fields are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO maintenance_requests 
       (user_id, title, description, location, urgency, image_url)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.id, title, description, location, urgency, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('CREATE REQUEST ERROR:', err);
    res.status(500).json({ message: err.message });
  }
});

// READ - student sees their own requests
router.get('/mine', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM maintenance_requests WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

// READ - admin sees ALL requests
router.get('/all', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
  try {
    const result = await pool.query(
      `SELECT r.*, u.name as student_name, u.email 
       FROM maintenance_requests r
       JOIN users u ON r.user_id = u.id
       ORDER BY r.created_at DESC`
    );
    res.json(result.rows);
 } catch (err) {
    res.status(400).json({ message: err.message }); // changed this line
  }
});

// UPDATE status (admin)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    const result = await pool.query(
      `UPDATE maintenance_requests SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error updating request' });
  }
});

// DELETE (admin)
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
  try {
    await pool.query('DELETE FROM maintenance_requests WHERE id=$1', [req.params.id]);
    res.json({ message: 'Request deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting request' });
  }
});

module.exports = router;