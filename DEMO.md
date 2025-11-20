# 🎬 Demo Walkthrough

This guide demonstrates the Resume Screening Tool's capabilities using the provided sample data.

## Prerequisites

Before starting the demo, ensure:
- ✅ Backend server is running on `http://localhost:3001`
- ✅ Frontend dev server is running on `http://localhost:5173`
- ✅ OpenAI API key is configured in backend `.env`

## Demo Scenario

**Objective**: Screen a Senior Backend Developer candidate against a Senior Backend Engineer job opening.

**Files Used**:
- Resume: `samples/resume1.txt` (John Doe - 5 years experience)
- Job Description: `samples/job-description1.txt` (Senior Backend Engineer role)

## Step-by-Step Walkthrough

### Step 1: Open the Application

Navigate to `http://localhost:5173` in your browser.

**Expected View**:
- Application header: "🎯 Resume Screening Tool"
- Upload section with two upload zones
- Empty state message: "Get Started"

![Application landing page]

---

### Step 2: Upload Resume

**Actions**:
1. Click on the "Upload Resume" zone OR drag and drop `samples/resume1.txt`
2. Wait for upload confirmation

**Expected Result**:
- Upload zone shows ✅ "Resume Uploaded"
- Job Description upload zone becomes enabled
- Session ID created in backend

![Resume uploaded state]

**Backend Activity**:
```
POST /api/upload/resume
- File parsed (John Doe's resume)
- Text extracted and cleaned
- Session created with unique ID
- Returns: { sessionId, preview, message }
```

---

### Step 3: Upload Job Description

**Actions**:
1. Click on the "Upload Job Description" zone OR drag and drop `samples/job-description1.txt`
2. Wait for analysis to complete (automatic after JD upload)

**Expected Result**:
- Upload zone shows ✅ "Job Description Uploaded"
- Loading indicator appears: "Analyzing resume and job description..."
- Analysis completes after ~5-10 seconds

![Analysis loading state]

**Backend Activity**:
```
POST /api/upload/job-description
- Job description parsed
- Associated with session

Automatic POST /api/analyze (triggered by frontend)
- Extract resume skills, experience, education
- Extract JD requirements
- Calculate match score (~75%)
- Identify strengths and gaps
- Background: Index documents for RAG (chunking → embedding → vector storage)
```

---

### Step 4: View Match Analysis

**Expected Results**:

**Match Score**: ~75%
- Circular progress indicator with animated fill
- Color-coded based on score (blue for good match)

**Strengths** ✅:
- 5+ years React/Node.js experience
- Strong backend architecture skills
- BS Computer Science from SUNY Buffalo (state university)
- AWS experience
- PostgreSQL knowledge

**Gaps** ❌:
- No Kubernetes experience (required in JD)
- Limited cloud exposure (wants more extensive AWS)

**Key Insights** 💡:
- Strong candidate for this position
- Technical skills align well with requirements
- May need some upskilling in container orchestration

**Resume Highlights** 📋:
- **Experience**: 5 years
- **Education**: BS Computer Science, SUNY Buffalo
- **Top Skills**: JavaScript, TypeScript, Node.js, React, PostgreSQL, AWS, Docker, MongoDB, Express, Git

![Match analysis display]

---

### Step 5: Ask Questions (RAG-Powered)

**Suggested Questions Displayed**:
1. "Does this candidate have a degree from a state university?"
2. "Can they handle backend architecture?"
3. "What's their experience with cloud technologies?"
4. "Do they have team leadership experience?"

#### Question 1: State University Degree

**User Input**: "Does this candidate have a degree from a state university?"

**Expected Answer**:
> "Yes, the candidate has a Bachelor of Science in Computer Science from SUNY Buffalo (State University of New York at Buffalo), which is a state university. He graduated in May 2017 with a GPA of 3.7/4.0."

**Sources**: [Education]

![Chat question 1]

**Behind the Scenes**:
```
1. Question embedded using OpenAI
2. Similarity search in vector DB
3. Retrieved chunk: [Education section]
4. Context + question sent to GPT-3.5-turbo
5. Answer generated citing specific details
```

---

#### Question 2: Backend Architecture

**User Input**: "Can he handle backend architecture?"

**Expected Answer**:
> "Yes, based on his experience, he can handle backend architecture. He has 5+ years as a Senior Backend Developer where he designed and implemented microservices architecture serving 2M+ daily active users. He also has a strong understanding of system design and software architecture principles as mentioned in his additional information section."

**Sources**: [Experience, Summary]

![Chat question 2]

---

#### Question 3: Kubernetes Experience

**User Input**: "What's his experience with Kubernetes?"

**Expected Answer**:
> "I don't have information about Kubernetes experience in this resume. The candidate has experience with Docker and containerization, but Kubernetes is not explicitly mentioned in his technical skills or work experience."

**Sources**: [Skills, Experience]

*Note: This demonstrates RAG accurately identifying missing information*

![Chat question 3]

---

#### Question 4: Custom Question

**User Input**: "Is he authorized to work in the US?"

**Expected Answer**:
> "Yes, according to the resume, he is authorized to work in the US. This is mentioned in the Additional Information section."

**Sources**: [Other]

![Chat question 4]

---

### Step 6: Conversation Context

The chat maintains conversation history, enabling follow-up questions:

**Follow-up**: "What about his PostgreSQL experience specifically?"

**Expected Answer**:
> "He has professional experience with PostgreSQL. In his Senior Backend Developer role at Tech Solutions Inc., he optimized database queries, reducing response time by 40%. He also worked with PostgreSQL in his previous role at Digital Innovations LLC. PostgreSQL is listed among his technical skills with databases."

![Follow-up question]

---

## Key Demonstrations

### ✅ Proper RAG Implementation

**Evidence**:
1. **Vector Storage**: Documents chunked and embedded before querying
2. **Semantic Search**: Retrieves relevant sections based on question meaning
3. **Context-Grounded**: Answers cite specific resume sections
4. **Missing Information**: Correctly identifies when data not in resume

### ✅ Accurate Match Scoring

**Evidence**:
1. **Skills Match**: Identified most required skills present
2. **Gap Detection**: Flagged missing Kubernetes despite similar Docker experience
3. **Weighted Algorithm**: Balanced score across skills, experience, education
4. **Realistic Score**: 75% match (not artificially inflated)

### ✅ Modern UI/UX

**Evidence**:
1. **Visual Design**: Dark theme, gradients, glassmorphism
2. **Animations**: Smooth transitions, typing indicators
3. **Responsive**: Works on different screen sizes
4. **Loading States**: Clear feedback during operations
5. **Error Handling**: Graceful error messages

---

## Alternative Demo Scenarios

### Scenario 2: Mid-Level Full-Stack Match

**Files**:
- Resume: `samples/resume2.txt` (Sarah Chen - 3 years)
- JD: `samples/job-description2.txt` (Full-Stack Developer)

**Expected Results**:
- Higher match score (~85-90%)
- Strengths: React, Node.js, full-stack experience
- Fewer gaps due to aligned requirements
- Questions about recent projects, specific skills

### Scenario 3: Experience Mismatch

**Files**:
- Resume: `samples/resume2.txt` (Sarah Chen - 3 years)
- JD: `samples/job-description1.txt` (Senior role requiring 5+ years)

**Expected Results**:
- Lower match score (~60-65%)
- Gaps: Insufficient experience, missing senior-level skills
- Strengths: Still has relevant technologies
- RAG correctly identifies experience level

---

## Performance Metrics

**Expected Timings**:
- Resume upload: < 1 second
- JD upload: < 1 second
- Analysis (including RAG indexing): 5-10 seconds
- Chat response: 2-4 seconds per question

**Resource Usage**:
- OpenAI API calls:
  - Embeddings: ~10-15 per resume/JD pair
  - Chat completions: 1 per question
- Memory: ~100-200 MB (ChromaDB in-memory)

---

## Troubleshooting Demo Issues

### "Failed to analyze resume"
- **Check**: OpenAI API key is valid
- **Check**: Backend console for detailed error
- **Solution**: Verify API key has sufficient credits

### "No response from chat"
- **Check**: Documents were indexed (check backend logs)
- **Check**: Network tab shows successful POST to /api/chat
- **Solution**: Restart backend server, re-upload documents

### Slow response times
- **Cause**: OpenAI API latency
- **Expected**: First request may be slower
- **Normal**: 2-4 seconds for chat responses

---

## Video Recording Checklist

When recording the demo video, include:

- [ ] Application landing page
- [ ] Resume upload process (show drag-and-drop)
- [ ] Job description upload
- [ ] Loading state during analysis
- [ ] Match analysis results (zoom into score)
- [ ] Hover over strengths and gaps
- [ ] Scroll through insights
- [ ] Click on suggested question
- [ ] Show typing indicator
- [ ] Read answer aloud
- [ ] Ask 2-3 more questions demonstrating RAG
- [ ] Ask a question about missing information
- [ ] Show conversation history
- [ ] Briefly show code (backend RAG service)
- [ ] Show ChromaDB vector storage in action
- [ ] Wrap up with key features summary

**Duration**: 3-5 minutes
**Format**: Screen recording with voiceover
**Tools**: OBS Studio, Loom, or QuickTime

---

## Conclusion

This demo showcases:
✅ True RAG implementation (not just direct LLM queries)
✅ Intelligent resume analysis with weighted scoring
✅ Context-aware question answering grounded in resume content
✅ Modern, professional UI with smooth UX
✅ Production-ready architecture with proper separation of concerns

The application successfully demonstrates AI-powered resume screening with semantic search and retrieval-augmented generation.
