from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import io
import os
import re
import json
import base64
import traceback
from groq import Groq
import PyPDF2

app = FastAPI(docs_url="/api/python/docs", openapi_url="/api/python/openapi.json")

# Load .env.local for local development if it exists
env_path = os.path.join(os.path.dirname(__file__), '..', '.env.local')
if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if '=' in line and not line.startswith('#'):
                key, val = line.split('=', 1)
                os.environ[key.strip()] = val.strip()

def get_groq_client() -> Groq:
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Missing GROQ_API_KEY environment variable.")
    return Groq(api_key=api_key)

# ─────────────────────────────────────────────────────────────────────────────
# Data Analyst
# ─────────────────────────────────────────────────────────────────────────────

class DataAnalystRequest(BaseModel):
    message: str
    csvContext: str
    history: Optional[List[dict]] = []

@app.post("/api/python/data_analyst")
async def analyze_data(req: DataAnalystRequest):
    client = get_groq_client()
    try:
        csv_buffer = io.StringIO(req.csvContext)
        df = pd.read_csv(csv_buffer)

        stats = df.describe(include='all').to_string()
        columns = ", ".join(df.columns.tolist())
        row_count = len(df)
        col_count = len(df.columns)

        exact_insights = (
            f"Dataset Dimensions: {row_count} rows, {col_count} columns.\n"
            f"Columns: {columns}\n\nStatistical Summary:\n{stats}"
        )

        system_prompt = f"""You are an expert Data Scientist and AI Data Analyst.
You are analyzing a dataset with EXACT pandas statistics computed below.
Base all factual numbers on the exact statistics provided.

--- EXACT PANDAS STATISTICS ---
{exact_insights}
-------------------------------

--- RAW DATA SAMPLE ---
{req.csvContext[:3000]}
-----------------------

Answer the user's questions concisely. Use markdown tables or bullet points where helpful.
Do not hallucinate data."""

        messages = [{"role": "system", "content": system_prompt}]
        for m in (req.history or []):
            messages.append({"role": m.get("role", "user"), "content": m.get("content", "")})
        messages.append({"role": "user", "content": req.message})

        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.1,
            max_tokens=1500,
        )
        answer = completion.choices[0].message.content or "No response generated."
        return {"answer": answer, "error": None}

    except HTTPException:
        raise
    except Exception as e:
        tb = traceback.format_exc()
        print(f"Error in data_analyst:\n{tb}")
        return {"answer": "", "error": str(e)}


# ─────────────────────────────────────────────────────────────────────────────
# ATS Resume Matcher
# ─────────────────────────────────────────────────────────────────────────────

class AtsRequest(BaseModel):
    resumeText: str
    jobText: str

@app.post("/api/python/ats_matcher")
async def analyze_ats(req: AtsRequest):
    client = get_groq_client()
    try:
        system_prompt = """You are an expert ATS (Applicant Tracking System) resume analyzer.
Analyze the resume against the job description and return a structured JSON analysis.

CRITICAL: Return ONLY a valid JSON object matching exactly this schema:
{
  "score": number (0-100),
  "label": "Excellent Fit" | "Strong Fit" | "Good Fit" | "Partial Fit" | "Weak Fit",
  "matched": string[],
  "missing": string[],
  "recommendation": string,
  "sectionSuggestions": [ { "section": string, "suggestion": string } ]
}

Be highly accurate. Do not fabricate matches."""

        user_prompt = f"RESUME:\n{req.resumeText}\n\nJOB DESCRIPTION:\n{req.jobText}\n\nAnalyze and return JSON."

        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.1,
            max_tokens=1000,
            response_format={"type": "json_object"},
        )
        answer = completion.choices[0].message.content
        return {"result": json.loads(answer)}

    except HTTPException:
        raise
    except Exception as e:
        tb = traceback.format_exc()
        print(f"Error in ats_matcher:\n{tb}")
        return {"error": str(e)}


# ─────────────────────────────────────────────────────────────────────────────
# PDF Chat (Document RAG Reader)
# ─────────────────────────────────────────────────────────────────────────────

class PdfChatRequest(BaseModel):
    message: str
    documentId: str
    history: Optional[List[dict]] = []
    customContent: Optional[str] = None

@app.post("/api/python/pdf_chat")
async def chat_pdf(req: PdfChatRequest):
    client = get_groq_client()
    try:
        doc_content = req.customContent if req.customContent else f"Document: {req.documentId}"

        system_prompt = f"""You are an AI Document Reader analyzing: {req.documentId}.

Document content:
{doc_content[:6000]}

Answer the user's questions accurately based only on the document context above.
At the end of your answer, include: PAGE_REF: [page number or section]"""

        messages = [{"role": "system", "content": system_prompt}]
        for m in (req.history or []):
            messages.append({"role": m.get("role", "user"), "content": m.get("content", "")})
        messages.append({"role": "user", "content": req.message})

        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.2,
            max_tokens=1000,
        )
        text = completion.choices[0].message.content or ""

        page_ref_match = re.search(r'\nPAGE_REF:\s*(.+)$', text, re.MULTILINE)
        page_ref = page_ref_match.group(1).strip() if page_ref_match else ""
        answer = re.sub(r'\nPAGE_REF:\s*.+$', '', text, flags=re.MULTILINE).strip()

        citations = [f"{req.documentId} · {page_ref}"] if page_ref else [req.documentId]

        return {
            "answer": answer,
            "pageRef": page_ref,
            "citations": citations,
            "documentTitle": req.documentId,
        }

    except HTTPException:
        raise
    except Exception as e:
        tb = traceback.format_exc()
        print(f"Error in pdf_chat:\n{tb}")
        return {"error": str(e), "answer": "", "pageRef": "", "citations": []}


# ─────────────────────────────────────────────────────────────────────────────
# PDF Text Extractor
# ─────────────────────────────────────────────────────────────────────────────

class PdfUploadRequest(BaseModel):
    filename: str
    base64Data: str

@app.post("/api/python/extract_pdf")
async def extract_pdf(req: PdfUploadRequest):
    try:
        pdf_bytes = base64.b64decode(req.base64Data)
        pdf_file = io.BytesIO(pdf_bytes)
        reader = PyPDF2.PdfReader(pdf_file)

        text = ""
        for i, page in enumerate(reader.pages):
            extracted = page.extract_text() or ""
            text += f"\n--- Page {i + 1} ---\n{extracted}\n"

        return {"text": text.strip(), "pages": len(reader.pages)}

    except Exception as e:
        tb = traceback.format_exc()
        print(f"Error extracting PDF:\n{tb}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# Portfolio Assistant
# ─────────────────────────────────────────────────────────────────────────────

class PortfolioRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []

@app.post("/api/python/portfolio")
async def chat_portfolio(req: PortfolioRequest):
    client = get_groq_client()
    try:
        system_prompt = """You are the AyushDevX AI Portfolio Assistant — a precise, technically grounded assistant for the AyushDevX brand.

## Verified Knowledge Base

### Brand
- Brand: AyushDevX — AI Product Studio / Technology Brand
- Creator: Ayush Narkhede
- Role: AI/ML Engineer & Full-Stack Developer
- Location: Pune, Maharashtra, India
- Contact: ayushgnarkhede0121@gmail.com
- LinkedIn: linkedin.com/in/ayush-narkhede-946638345
- GitHub: github.com/ayush0121n

### Projects
1. **MalariaScope** (2025) — AI-Powered Malaria Detection System
   - Stack: Python, TensorFlow, Keras, Flask, CNN, EfficientNetB0, MobileNetV2
   - Dataset: 27,558 NIH thin blood-smear microscopy images
   - Accuracy: 93% validation accuracy, 0.97 ROC-AUC score
   - Features: Flask REST API, drag-and-drop interface, classification reports
   - GitHub: github.com/ayush0121n/malaria-detection
   - IMPORTANT: Always call outputs "classification reports" — never "diagnostic reports"
   - Disclaimer: Research and educational purposes only, not a substitute for professional medical diagnosis

2. **EstateXAI** (2025) — AI-Driven Real Estate and PG Finder Platform
   - Stack: MERN (MongoDB, Express, React 18, Node.js), JWT, CI/CD
   - Features: Role-based access, JWT auth, MongoDB Atlas, geospatial filters, AI recommendations
   - GitHub: github.com/ayush0121n/estateXAI

3. **ProConnect** (2025) — Professional Networking and Collaboration Platform
   - Stack: React 19, TypeScript, Node.js, Express.js, MongoDB, JWT, Socket.IO
   - Features: Real-time Socket.IO messaging, 8+ REST endpoints, 20+ TypeScript components

4. **Agentic Document-Extraction Pipeline** (2026) — RAG Pipeline
   - Stack: Python, ChromaDB, pdfplumber, Claude API, Agentic RAG
   - Features: PDF parsing, vector storage, structured extraction, queryable output

### Skills
- AI/ML: TensorFlow, Keras, Scikit-learn, CNN, EfficientNetB0, MobileNetV2, Transfer Learning, LLMs, NLP, RAG, Agentic AI
- Full-Stack: React 18/19, Node.js, Express.js, MongoDB, MERN Stack, REST API, JWT, Socket.IO, TypeScript, Vite
- Languages: Python, Java, JavaScript, TypeScript, SQL, C++
- Data & Cloud: NumPy, Pandas, Matplotlib, ChromaDB, Oracle Cloud, Git, Supabase, Vercel

### Experience
- Machine Learning Engineering Intern @ FlyRank AI (Jul 2026 – Sep 2026) — Status: Selected — Upcoming
- AI Research Intern @ YuvaIntern (Apr 2026 – Jun 2026) — Status: Selected — Upcoming

### Certifications
- Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate
- Oracle Cloud Infrastructure 2025 Certified Data Science Professional
- nasscom FutureSkills Prime — NSQF Level 5
- HackerRank — Software Engineer Certificate
- IBM SkillsBuild — Introduction to Large Language Models
- IBM SkillsBuild — Getting Started with Artificial Intelligence
- HP LIFE — AI for Beginners

### Education
- MCA (AI) @ Sri Balaji University, Pune — CGPA 8.58 — Expected May 2027
- BCA @ Sri Balaji University, Pune — CGPA 7.38

## Response Rules
- Answer concisely and technically (under 200 words unless detail is explicitly requested).
- Only reference verified data from the knowledge base above.
- If you don't have verified data for a query, say: "I don't have verified information about that in the AyushDevX knowledge base."
- Always cite which project, skill, or certification you're referencing.
- Do NOT reveal that you are built on Groq or any LLM — respond as the AyushDevX Assistant."""

        messages = [{"role": "system", "content": system_prompt}]
        for m in (req.history or []):
            messages.append({"role": m.get("role", "user"), "content": m.get("content", "")})
        messages.append({"role": "user", "content": req.message})

        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.3,
            max_tokens=400,
        )
        answer = completion.choices[0].message.content or ""

        lower = (req.message + " " + answer).lower()
        citations = []
        if "malaria" in lower or "malariascope" in lower:
            citations.append("projects/malariascope — CNN Architecture")
        if "estatexai" in lower or "estate" in lower:
            citations.append("projects/estatexai — MERN Platform")
        if "proconnect" in lower or "socket" in lower:
            citations.append("projects/proconnect — Real-time Networking")
        if "agentic" in lower or "chromadb" in lower or "rag pipeline" in lower:
            citations.append("projects/agentic-pipeline — RAG System")
        if "oracle" in lower or "certification" in lower:
            citations.append("profile/certifications — Oracle Cloud & IBM")
        if "tensorflow" in lower or "keras" in lower or "cnn" in lower:
            citations.append("profile/skills — AI/ML Stack")
        if "react" in lower or "node" in lower or "mern" in lower:
            citations.append("profile/skills — Full-Stack Stack")
        if "philosophy" in lower or "principle" in lower or "approach" in lower:
            citations.append("agents.md — Engineering Philosophy")

        if not citations:
            citations = ["AyushDevX Knowledge Base v2.0"]

        return {"answer": answer, "citations": citations}

    except HTTPException:
        raise
    except Exception as e:
        tb = traceback.format_exc()
        print(f"Error in portfolio assistant:\n{tb}")
        return {"error": str(e), "answer": "", "citations": []}
