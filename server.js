const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();
const PORT = 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'public/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Database file path
const QUESTIONS_FILE = path.join(__dirname, 'questions.json');

// Initialize questions file if it doesn't exist
if (!fs.existsSync(QUESTIONS_FILE)) {
  fs.writeFileSync(QUESTIONS_FILE, '[]', 'utf8');
}

// API Routes
app.get('/api/questions', (req, res) => {
  try {
    const questions = JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf8'));
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Error reading questions' });
  }
});

app.post('/api/questions', upload.single('image'), (req, res) => {
  const { question, correctAnswer, wrongAnswer1, wrongAnswer2, wrongAnswer3 } = req.body;
  
  // Validation
  if (!question || !correctAnswer || !wrongAnswer1 || !wrongAnswer2 || !wrongAnswer3) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const wrongAnswers = [wrongAnswer1, wrongAnswer2, wrongAnswer3];
  const imageURL = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const questions = JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf8'));
    questions.push({
      question,
      imageURL,
      correctAnswer,
      wrongAnswers
    });
    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2), 'utf8');
    res.status(201).json({ message: 'Question added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error saving question' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});