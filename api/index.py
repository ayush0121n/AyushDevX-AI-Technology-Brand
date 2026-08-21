from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import io
import os
import re
import json
import base64
import traceback
import httpx
import PyPDF2
from mangum import Mangum

# ─────────────────────────────────────────────────────────────────────────────
# App Setup
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(docs_url="/api/python/docs", openapi_url="/api/python/openapi.json")

# CORS — allow requests from the SPA (same origin on Vercel, localhost in dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Vercel SPA is same-origin; this also allows local dev
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# ─────────────────────────────────────────────────────────────────────────────
# Mangum Handler — Required for Vercel Python Serverless Functions
# lifespan="off" avoids startup/shutdown event issues in serverless context
# ─────────────────────────────────────────────────────────────────────────────
handler = Mangum(app, lifespan="off")


# ─────────────────────────────────────────────────────────────────────────────
# Health Check
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/api/python/health")
async def health():
    groq_key = os.environ.get("GROQ_API_KEY", "")
    return {
        "status": "ok",
        "groq_key_set": bool(groq_key),
        "groq_key_prefix": (groq_key[:8] + "...") if groq_key else None,
        "python_version": __import__("sys").version,
    }


@app.get("/api/python/debug")
def debug():
    """Diagnostic endpoint: tries a minimal Groq call and returns raw error details."""
    api_key = os.environ.get("GROQ_API_KEY", "").strip()
    if not api_key:
        return {"ok": False, "error": "No GROQ_API_KEY set"}
    try:
        with httpx.Client(timeout=15.0, verify=True) as client:
            resp = client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "groq/compound-mini",
                    "messages": [{"role": "user", "content": "Say OK"}],
                    "max_tokens": 5,
                    "temperature": 0,
                    "stream": False,
                },
            )
        return {
            "ok": resp.is_success,
            "status_code": resp.status_code,
            "body_preview": resp.text[:500],
        }
    except Exception as e:
        return {
            "ok": False,
            "exception_type": type(e).__name__,
            "exception_msg": str(e),
            "traceback": traceback.format_exc(),
        }


# ─────────────────────────────────────────────────────────────────────────────
# Groq API Key Helper
# ─────────────────────────────────────────────────────────────────────────────

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


def get_groq_api_key() -> str:
    api_key = os.environ.get("GROQ_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="AI service is temporarily unavailable. Please try again later.",
        )
    return api_key


# ─────────────────────────────────────────────────────────────────────────────
# Direct Groq REST API Call — synchronous httpx.Client
# Vercel Python serverless + Mangum has async event loop lifecycle issues.
# Synchronous httpx.Client per request is the reliable pattern here.
# ─────────────────────────────────────────────────────────────────────────────

def call_groq(
    api_key: str,
    model: str,
    messages: list,
    max_tokens: int = 800,
    temperature: float = 0.3,
    json_mode: bool = False,
    timeout: float = 28.0,
) -> str:
    """
    Synchronous Groq REST API call via httpx.Client.
    Synchronous is required for reliability in Vercel's Python serverless runtime
    (async event loops are unstable across cold starts with Mangum).
    """
    payload: dict = {
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
        "stream": False,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    with httpx.Client(timeout=timeout, verify=True) as client:
        resp = client.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
        )

    if resp.status_code == 429:
        raise RuntimeError("rate_limit: The AI service is busy right now.")
    if resp.status_code in (401, 403):
        raise RuntimeError("auth_error: AI service authentication error.")
    if resp.status_code >= 500:
        raise RuntimeError(f"server_error: Groq returned {resp.status_code}.")
    if not resp.is_success:
        raise RuntimeError(f"api_error: Groq returned {resp.status_code}.")

    data = resp.json()
    return data["choices"][0]["message"]["content"] or ""


# ─────────────────────────────────────────────────────────────────────────────
# Shared friendly error mapper
# ─────────────────────────────────────────────────────────────────────────────

def friendly_error(e: Exception) -> str:
    msg = str(e).lower()
    if "rate_limit" in msg or "429" in msg or "rate limit" in msg:
        return "The AI service is busy right now. Please wait 30 seconds and try again."
    if "tokens" in msg and ("limit" in msg or "exceed" in msg):
        return "Your input is too long. Please shorten your text and try again."
    if "401" in msg or "403" in msg or "authentication" in msg or "auth_error" in msg:
        return "AI service authentication error. Please contact support."
    if "timeout" in msg or "timed out" in msg:
        return "The AI request timed out. Please try again with a shorter input."
    if "connection" in msg or "connect" in msg:
        return "Cannot connect to AI service. Please try again in a moment."
    return "AI service encountered an error. Please try again in a moment."


# ─────────────────────────────────────────────────────────────────────────────
# Data Analyst
# ─────────────────────────────────────────────────────────────────────────────

class DataAnalystRequest(BaseModel):
    message: str
    csvContext: str
    history: Optional[List[dict]] = []

@app.post("/api/python/data_analyst")
def analyze_data(req: DataAnalystRequest):
    api_key = get_groq_api_key()
    try:
        # Limit CSV context to avoid token overload
        csv_sample = req.csvContext[:2000]
        csv_buffer = io.StringIO(req.csvContext[:5000])
        df = pd.read_csv(csv_buffer)

        # Trim stats to avoid token overload — use only numeric summary
        numeric_df = df.select_dtypes(include="number")
        stats = numeric_df.describe().to_string() if not numeric_df.empty else "No numeric columns."
        columns = ", ".join(df.columns.tolist())
        row_count = len(df)
        col_count = len(df.columns)

        exact_insights = (
            f"Dataset: {row_count} rows × {col_count} columns.\n"
            f"Columns: {columns}\n\nNumeric Summary:\n{stats}"
        )

        system_prompt = (
            "You are a Data Analyst. Answer the user's question about their dataset concisely.\n\n"
            f"--- DATASET STATS ---\n{exact_insights}\n\n"
            f"--- DATA SAMPLE (first 2000 chars) ---\n{csv_sample}\n"
            "Use markdown tables or bullet points where helpful. Do not hallucinate data."
        )

        messages = [{"role": "system", "content": system_prompt}]
        # Only keep last 4 history turns to save tokens
        for m in (req.history or [])[-4:]:
            messages.append({"role": m.get("role", "user"), "content": str(m.get("content", ""))[:400]})
        messages.append({"role": "user", "content": req.message[:800]})

        answer = call_groq(
            api_key=api_key,
            model="groq/compound-mini",
            messages=messages,
            max_tokens=800,
            temperature=0.1,
        )
        return {"answer": answer or "No response generated.", "error": None}

    except HTTPException:
        raise
    except Exception as e:
        tb = traceback.format_exc()
        print(f"[data_analyst] Error:\n{tb}")
        return {"answer": "", "error": friendly_error(e)}


# ─────────────────────────────────────────────────────────────────────────────
# ATS Resume Matcher
# ─────────────────────────────────────────────────────────────────────────────

class AtsRequest(BaseModel):
    resumeText: str
    jobText: str

@app.post("/api/python/ats_matcher")
def analyze_ats(req: AtsRequest):
    api_key = get_groq_api_key()
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

        # Trim inputs to avoid token overload
        resume_trimmed = req.resumeText[:2500]
        job_trimmed = req.jobText[:1500]
        user_prompt = f"RESUME:\n{resume_trimmed}\n\nJOB DESCRIPTION:\n{job_trimmed}\n\nAnalyze and return JSON."

        answer = call_groq(
            api_key=api_key,
            model="groq/compound-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=800,
            temperature=0.1,
            json_mode=True,
        )
        return {"result": json.loads(answer)}

    except HTTPException:
        raise
    except Exception as e:
        tb = traceback.format_exc()
        print(f"[ats_matcher] Error:\n{tb}")
        return {"error": friendly_error(e)}


# ─────────────────────────────────────────────────────────────────────────────
# PDF Chat (Document RAG Reader)
# ─────────────────────────────────────────────────────────────────────────────

class PdfChatRequest(BaseModel):
    message: str
    documentId: str
    history: Optional[List[dict]] = []
    customContent: Optional[str] = None

@app.post("/api/python/pdf_chat")
def chat_pdf(req: PdfChatRequest):
    api_key = get_groq_api_key()
    try:
        doc_content = req.customContent if req.customContent else f"Document: {req.documentId}"

        system_prompt = (
            f"You are an AI Document Reader analyzing: {req.documentId}.\n\n"
            f"Document content:\n{doc_content[:4000]}\n\n"
            "Answer the user's questions accurately based only on the document context above. "
            "At the end of your answer, include: PAGE_REF: [page number or section]"
        )

        messages = [{"role": "system", "content": system_prompt}]
        # Only keep last 4 history turns
        for m in (req.history or [])[-4:]:
            messages.append({"role": m.get("role", "user"), "content": str(m.get("content", ""))[:400]})
        messages.append({"role": "user", "content": req.message[:600]})

        text = call_groq(
            api_key=api_key,
            model="groq/compound-mini",
            messages=messages,
            max_tokens=700,
            temperature=0.2,
        )

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
        print(f"[pdf_chat] Error:\n{tb}")
        return {"error": friendly_error(e), "answer": "", "pageRef": "", "citations": []}


# ─────────────────────────────────────────────────────────────────────────────
# PDF Text Extractor
# ─────────────────────────────────────────────────────────────────────────────

class PdfUploadRequest(BaseModel):
    filename: str
    base64Data: str

@app.post("/api/python/extract_pdf")
def extract_pdf(req: PdfUploadRequest):
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
        print(f"[extract_pdf] Error:\n{tb}")
        raise HTTPException(status_code=500, detail=friendly_error(e))


# ─────────────────────────────────────────────────────────────────────────────
# Portfolio Assistant
# ─────────────────────────────────────────────────────────────────────────────

class PortfolioRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []

@app.post("/api/python/portfolio")
def chat_portfolio(req: PortfolioRequest):
    api_key = get_groq_api_key()
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
        # Only keep last 6 history turns
        for m in (req.history or [])[-6:]:
            messages.append({"role": m.get("role", "user"), "content": str(m.get("content", ""))[:500]})
        messages.append({"role": "user", "content": req.message[:600]})

        answer = call_groq(
            api_key=api_key,
            model="groq/compound-mini",
            messages=messages,
            max_tokens=400,
            temperature=0.3,
        )

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
        print(f"[portfolio] Error:\n{tb}")
        return {"error": friendly_error(e), "answer": "", "citations": []}
