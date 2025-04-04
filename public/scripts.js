// Global variables
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 15;
let selectedAnswer = null;
let correctAnswerIndex = null;

// DOM elements
const questionForm = document.getElementById('questionForm');
const questionsList = document.getElementById('questionsList');
const messageDiv = document.getElementById('message');
const questionText = document.getElementById('questionText');
const questionImage = document.getElementById('questionImage');
const answerElements = [
  document.getElementById('answer0'),
  document.getElementById('answer1'),
  document.getElementById('answer2'),
  document.getElementById('answer3')
];
const answerButtons = document.querySelectorAll('.answer-btn');
const currentQuestionSpan = document.getElementById('currentQuestion');
const totalQuestionsSpan = document.getElementById('totalQuestions');
const timeLeftSpan = document.getElementById('timeLeft');
const progressBar = document.getElementById('progressBar');
const resultMessage = document.getElementById('resultMessage');
const nextButton = document.getElementById('nextButton');
const scoreSpan = document.getElementById('score');
const gameOverModal = document.getElementById('gameOverModal');
const gameOverTitle = document.getElementById('gameOverTitle');
const gameOverMessage = document.getElementById('gameOverMessage');

// Initialize based on current page
document.addEventListener('DOMContentLoaded', function() {
  if (window.location.pathname.includes('admin.html')) {
    initAdminPage();
  } else if (window.location.pathname.includes('quiz.html')) {
    initQuizPage();
  }
});

// ADMIN PAGE FUNCTIONS
function initAdminPage() {
  loadQuestions();
  
  // Handle image upload preview
  document.getElementById('imageUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      document.getElementById('fileName').textContent = file.name;
      const reader = new FileReader();
      reader.onload = function(event) {
        const preview = document.getElementById('previewImage');
        preview.src = event.target.result;
        document.getElementById('imagePreview').classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    }
  });

  questionForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData();
    const imageFile = document.getElementById('imageUpload').files[0];
    if (imageFile) {
      formData.append('image', imageFile);
    }

    formData.append('question', document.getElementById('question').value);
    formData.append('correctAnswer', document.getElementById('correctAnswer').value);
    formData.append('wrongAnswer1', document.getElementById('wrongAnswer1').value);
    formData.append('wrongAnswer2', document.getElementById('wrongAnswer2').value);
    formData.append('wrongAnswer3', document.getElementById('wrongAnswer3').value);

    saveQuestion(formData);
  });
}

function loadQuestions() {
  fetch('/api/questions')
    .then(response => response.json())
    .then(data => {
      questions = data;
      displayQuestions();
    })
    .catch(error => {
      console.error('Error loading questions:', error);
      showMessage('Error al cargar las preguntas', 'error');
    });
}

function displayQuestions() {
  if (questions.length === 0) {
    questionsList.innerHTML = '<p class="text-gray-500">No hay preguntas aún</p>';
    return;
  }

  questionsList.innerHTML = '';
  questions.forEach((q, index) => {
    const questionElement = document.createElement('div');
    questionElement.className = 'border-b border-gray-200 pb-4';
    questionElement.innerHTML = `
      <div class="flex justify-between items-start">
        <div>
          <h3 class="font-medium">${q.question}</h3>
          <p class="text-sm text-gray-500">Respuesta correcta: ${q.correctAnswer}</p>
        </div>
        <button onclick="deleteQuestion(${index})" class="text-red-500 hover:text-red-700">
          <i class="fas fa-trash"></i>
        </button>
      </div>
      ${q.imageURL ? `<img src="${q.imageURL}" class="mt-2 h-20 object-cover rounded">` : ''}
    `;
    questionsList.appendChild(questionElement);
  });
}

function saveQuestion(question) {
  fetch('/api/questions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(question)
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      showMessage(data.error, 'error');
    } else {
      showMessage('Pregunta guardada correctamente', 'success');
      questionForm.reset();
      loadQuestions();
    }
  })
  .catch(error => {
    console.error('Error saving question:', error);
    showMessage('Error al guardar la pregunta', 'error');
  });
}

function deleteQuestion(index) {
  if (confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) {
    fetch('/api/questions')
      .then(response => response.json())
      .then(data => {
        data.splice(index, 1);
        return fetch('/api/questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data[0]) // This needs to be adjusted to update the entire array
        });
      })
      .then(response => {
        if (response.ok) {
          showMessage('Pregunta eliminada', 'success');
          loadQuestions();
        }
      })
      .catch(error => {
        console.error('Error deleting question:', error);
        showMessage('Error al eliminar la pregunta', 'error');
      });
  }
}

function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `p-4 rounded mb-8 ${type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
  messageDiv.classList.remove('hidden');
  
  setTimeout(() => {
    messageDiv.classList.add('hidden');
  }, 3000);
}

// QUIZ PAGE FUNCTIONS
function initQuizPage() {
  fetch('/api/questions')
    .then(response => response.json())
    .then(data => {
      if (data.length === 0) {
        questionText.textContent = 'No hay preguntas disponibles. Por favor, agrega preguntas en el panel de administración.';
        document.getElementById('answersContainer').classList.add('hidden');
        return;
      }

      questions = data;
      totalQuestionsSpan.textContent = questions.length;
      loadQuestion();
    })
    .catch(error => {
      console.error('Error loading questions:', error);
      questionText.textContent = 'Error al cargar las preguntas. Por favor, intenta nuevamente.';
    });
}

function loadQuestion() {
  if (currentQuestionIndex >= questions.length) {
    endGame(true);
    return;
  }

  // Reset state
  clearInterval(timer);
  timeLeft = 15;
  selectedAnswer = null;
  resultMessage.classList.add('hidden');
  nextButton.classList.add('hidden');
  answerButtons.forEach(btn => {
    btn.disabled = false;
    btn.classList.remove('bg-green-500', 'bg-red-500', 'opacity-50');
  });

  // Update UI
  const currentQuestion = questions[currentQuestionIndex];
  questionText.textContent = currentQuestion.question;
  currentQuestionSpan.textContent = currentQuestionIndex + 1;

  // Show image if available
  if (currentQuestion.imageURL) {
    questionImage.src = currentQuestion.imageURL;
    questionImage.classList.remove('hidden');
  } else {
    questionImage.classList.add('hidden');
  }

  // Combine and shuffle answers
  const allAnswers = [
    currentQuestion.correctAnswer,
    ...currentQuestion.wrongAnswers
  ];
  shuffleArray(allAnswers);

  // Find the index of the correct answer after shuffling
  correctAnswerIndex = allAnswers.indexOf(currentQuestion.correctAnswer);

  // Display answers
  for (let i = 0; i < 4; i++) {
    answerElements[i].textContent = allAnswers[i];
  }

  // Start timer
  updateTimer();
  timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
  timeLeft--;
  timeLeftSpan.textContent = timeLeft;
  progressBar.style.width = `${(timeLeft / 15) * 100}%`;

  // Update timer appearance based on remaining time
  if (timeLeft <= 5) {
    timeLeftSpan.classList.add('danger');
    timeLeftSpan.classList.remove('warning');
    progressBar.style.background = 'linear-gradient(90deg, #FF5252 0%, #D32F2F 100%)';
  } else if (timeLeft <= 10) {
    timeLeftSpan.classList.add('warning');
    timeLeftSpan.classList.remove('danger');
    progressBar.style.background = 'linear-gradient(90deg, #FFC107 0%, #FFA000 100%)';
  } else {
    timeLeftSpan.classList.remove('warning', 'danger');
    progressBar.style.background = 'linear-gradient(90deg, #4FC3F7 0%, #2196F3 100%)';
  }

  if (timeLeft <= 0) {
    clearInterval(timer);
    timeOutQuestion();
  }
}

function timeOutQuestion() {
  answerButtons.forEach(btn => btn.disabled = true);
  answerButtons[correctAnswerIndex].classList.add('correct');
  
  resultMessage.innerHTML = `
    <div class="flex items-center">
      <i class="fas fa-clock text-2xl mr-2"></i>
      <span>¡Tiempo agotado! La respuesta correcta es: <strong>${questions[currentQuestionIndex].correctAnswer}</strong></span>
    </div>
  `;
  resultMessage.className = 'mt-4 p-3 rounded bg-yellow-500 bg-opacity-20 text-yellow-200 border border-yellow-500';
  resultMessage.classList.remove('hidden');
  nextButton.classList.remove('hidden');
}

function selectAnswer(index) {
  if (selectedAnswer !== null) return;
  
  selectedAnswer = index;
  clearInterval(timer);
  answerButtons.forEach(btn => btn.disabled = true);

  if (index === correctAnswerIndex) {
    // Correct answer
    answerButtons[index].classList.add('bg-green-500', 'text-white');
    resultMessage.textContent = '¡Correcto!';
    resultMessage.className = 'mt-4 p-3 rounded bg-green-100 text-green-800';
    score += 100;
    scoreSpan.textContent = score;
  } else {
    // Wrong answer
    answerButtons[index].classList.add('bg-red-500', 'text-white');
    answerButtons[correctAnswerIndex].classList.add('bg-green-500', 'text-white');
    resultMessage.textContent = 'Incorrecto. La respuesta correcta es: ' + questions[currentQuestionIndex].correctAnswer;
    resultMessage.className = 'mt-4 p-3 rounded bg-red-100 text-red-800';
  }

  resultMessage.classList.remove('hidden');
  nextButton.classList.remove('hidden');
}

function nextQuestion() {
  currentQuestionIndex++;
  loadQuestion();
}

function endGame(completed) {
  clearInterval(timer);
  document.getElementById('questionContainer').classList.add('hidden');
  document.getElementById('answersContainer').classList.add('hidden');
  
  gameOverTitle.textContent = completed ? '¡Felicidades!' : '¡Juego Terminado!';
  gameOverMessage.innerHTML = completed ? 
    `Has completado todas las preguntas.<br>Tu puntaje final es: <span class="font-bold">${score}</span>` :
    `Tu puntaje final es: <span class="font-bold">${score}</span>`;
  gameOverModal.classList.remove('hidden');
}

function restartGame() {
  currentQuestionIndex = 0;
  score = 0;
  scoreSpan.textContent = '0';
  gameOverModal.classList.add('hidden');
  document.getElementById('questionContainer').classList.remove('hidden');
  document.getElementById('answersContainer').classList.remove('hidden');
  loadQuestion();
}

// UTILITY FUNCTIONS
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Expose functions to global scope for HTML onclick attributes
window.selectAnswer = selectAnswer;
window.nextQuestion = nextQuestion;
window.restartGame = restartGame;
window.deleteQuestion = deleteQuestion;