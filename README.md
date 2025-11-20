# 🎯 Resume Screening Tool with RAG

An AI-powered resume screening application that uses Retrieval-Augmented Generation (RAG) to analyze resumes against job descriptions and enable intelligent Q&A about candidates.

## ✨ Features

- **📄 Document Upload**: Support for PDF and TXT resume and job description uploads
- **🤖 AI-Powered Analysis**: Intelligent matching using OpenAI GPT models
- **🎯 Match Scoring**: Weighted algorithm analyzing skills, experience, and education
- **💬 RAG-Powered Chat**: Ask questions about candidates with context-aware answers
- **📊 Visual Insights**: Beautiful UI showing strengths, gaps, and key insights
- **🔍 Semantic Search**: Vector-based retrieval for accurate question answering

## 🏗️ Tech Stack

### Backend
- **Node.js 18+** with TypeScript
- **Express.js** for REST API
- **OpenAI API** for embeddings and chat completion
- **ChromaDB** for in-memory vector storage
- **pdf-parse** for PDF text extraction

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Axios** for API communication
- Modern CSS with glassmorphism and gradients

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Rehan-Afzaal/resume-rag-screener.git
cd task
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
MAX_FILE_SIZE=10485760
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:3001
```

## 🎮 Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

The API will be available at `http://localhost:3001`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`

## 📖 Usage

1. **Upload Resume**: Click or drag-and-drop a resume file (PDF or TXT)
2. **Upload Job Description**: After uploading resume, upload a job description
3. **View Analysis**: See match score, strengths, gaps, and insights automatically
4. **Ask Questions**: Use the chat interface to ask questions about the candidate:
   - "Does this candidate have a degree from a state university?"
   - "Can they handle backend architecture?"
   - "What's their experience with PostgreSQL?"
   - "Is he eligible to work in the US?"

## 🔧 API Endpoints

### Upload Resume
```http
POST /api/upload/resume
Content-Type: multipart/form-data

file: <resume file>
sessionId: <optional session ID>
```

### Upload Job Description
```http
POST /api/upload/job-description
Content-Type: multipart/form-data

file: <job description file>
sessionId: <session ID from resume upload>
```

### Analyze Resume
```http
POST /api/analyze
Content-Type: application/json

{
  "sessionId": "<session ID>"
}
```

### Chat
```http
POST /api/chat
Content-Type: application/json

{
  "sessionId": "<session ID>",
  "question": "Does this candidate have React experience?"
}
```

## 🧪 Testing with Sample Data

Sample files are provided in the `samples/` directory:

- `resume1.txt` - Senior Backend Developer (5+ years, SUNY Buffalo, no Kubernetes)
- `resume2.txt` - Full-Stack Developer (3 years, SF State, strong frontend)
- `job-description1.txt` - Senior Backend Engineer (requires Kubernetes)
- `job-description2.txt` - Full-Stack Developer (mid-level)

Try uploading `resume1.txt` with `job-description1.txt` to see a ~75% match with identified gaps.

## 🏛️ Architecture

For detailed architecture information, see [ARCHITECTURE.md](./ARCHITECTURE.md)

### RAG Implementation

The application implements true RAG (Retrieval-Augmented Generation):

1. **Document Processing**: Resumes are chunked into sections (Skills, Experience, Education)
2. **Embedding Generation**: Each chunk is converted to a 1536-dimensional vector using OpenAI
3. **Vector Storage**: Embeddings are stored in ChromaDB with metadata
4. **Query Processing**: User questions are embedded and used for similarity search
5. **Context Retrieval**: Top 5 most relevant chunks are retrieved
6. **Answer Generation**: Retrieved context + question are sent to GPT for grounded answers

## 🎨 UI Features

- **Dark Mode**: Premium dark theme with gradients
- **Glassmorphism**: Modern frosted glass effects
- **Smooth Animations**: Micro-interactions and transitions
- **Responsive Design**: Works on all screen sizes
- **Loading States**: Visual feedback for all operations
- **Error Handling**: Clear error messages

## 📝 Project Structure

```
task/
├── backend/
│   ├── src/
│   │   ├── services/      # Core business logic
│   │   ├── routes/        # API endpoints
│   │   ├── types/         # TypeScript types
│   │   └── index.ts       # Express server
│   ├── uploads/           # Temporary file storage
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API client
│   │   ├── App.tsx        # Main app component
│   │   └── index.css      # Global styles
│   └── package.json
├── samples/               # Sample data files
├── README.md
├── ARCHITECTURE.md
└── DEMO.md
```

## 🐛 Troubleshooting

### Backend won't start
- Ensure OpenAI API key is set in `.env`
- Check that port 3001 is not in use
- Verify Node.js version is 18+

### Frontend can't connect to backend
- Ensure backend is running on port 3001
- Check CORS settings in backend `.env`
- Verify `VITE_API_URL` in frontend `.env`

### File upload fails
- Check file size (max 10MB by default)
- Ensure file is PDF or TXT format
- Verify `uploads/` directory exists in backend

## 📄 License

MIT

## 👥 Author

Built as a technical assessment for JobTalk.ai

## 🔗 Links

- [Demo Video](./DEMO.md)
- [Architecture Documentation](./ARCHITECTURE.md)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [ChromaDB Documentation](https://docs.trychroma.com/)
