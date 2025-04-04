
Built by https://www.blackbox.ai

---

```markdown
# User Workspace

## Project Overview
User Workspace is a simple Node.js application that allows users to upload questions along with an optional image. It utilizes Express.js for server management and Multer for handling file uploads. The application supports the storage and retrieval of questions from a local JSON file.

## Installation

To set up this project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/user-workspace.git
   cd user-workspace
   ```

2. **Install dependencies:**
   Make sure you have Node.js installed. Then run:
   ```bash
   npm install
   ```

3. **Create necessary directories:** 
   The application will automatically create directories for file uploading but can be created manually if needed.

## Usage

To start the server, run the following command:

```bash
npm start
```

The server will be running at `http://localhost:3000`.

### API Endpoints

- **GET /api/questions**
  - Retrieves a list of questions stored in the JSON file.

- **POST /api/questions**
  - Allows the user to upload a question along with optional images.
  - **Fields required:**
    - `question`: The question string.
    - `correctAnswer`: The correct answer string.
    - `wrongAnswer1`: The first wrong answer string.
    - `wrongAnswer2`: The second wrong answer string.
    - `wrongAnswer3`: The third wrong answer string.
    - `image`: (optional) The image associated with the question.

### Example Usage with `curl`

- To get questions:
  ```bash
  curl http://localhost:3000/api/questions
  ```

- To post a question:
  ```bash
  curl -X POST http://localhost:3000/api/questions -F "question=What is the capital of France?" -F "correctAnswer=Paris" -F "wrongAnswer1=London" -F "wrongAnswer2=Berlin" -F "wrongAnswer3=Madrid"
  ```

## Features
- Upload questions with images.
- Retrieve all stored questions.
- Automatically create directories for uploaded files.
- Simple REST API for easy integration.

## Dependencies
The project uses the following dependencies:

- **Express**: ^5.1.0
- **Multer**: ^1.4.5-lts.2

These dependencies are defined in the `package.json` file.

## Project Structure
```
user-workspace/
│
├── public/
│   └── uploads/       # Directory for storing uploaded images
│
├── questions.json     # File to store questions and answers
├── server.js          # Main server file
├── package.json       # npm dependencies and project metadata
└── package-lock.json  # Lock file for precise dependency versions
```

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- Inspired by various open-source contributions and personal learning goals.
```