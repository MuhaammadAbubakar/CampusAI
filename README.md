# CampusAI 🎓

> **Intelligent University Admission & Academic Advisory Portal**  
> Powered by Retrieval-Augmented Generation (RAG) and n8n Workflow Automation.

[![License: MIT](https://img.shields.io/badge/License-MIT-crimson.svg)](LICENSE)
[![Frontend: Vanilla](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20JS-darkred.svg)](#technology-stack)
[![Backend: n8n RAG](https://img.shields.io/badge/Engine-n8n%20%2B%20Pinecone%20%2B%20Groq-8F1515.svg)](#architecture)

---

## 🏛️ Overview

**CampusAI** is an academic advisory portal designed to help prospective Pakistani university students navigate their higher-education journey. Built with a rich crimson academic design system, it delivers instant, verified guidance on admissions, eligibility criteria, closing merits, fee schedules, and scholarships.

The platform combines a clean front-facing institutional portal with an interactive **RAG-powered Admission Desk** connected directly to an **n8n automated workflow engine**.

---

## ✨ Key Features

- **🎓 Verified Campus Knowledge Base**: Indexed with prospectus and statutory admission data for 8 premier universities:
  - University of the Punjab (PU), Lahore
  - Government College University (GCU), Lahore
  - University of Engineering and Technology (UET), Lahore
  - University of Sargodha (UOS)
  - Quaid-i-Azam University (QAU), Islamabad
  - University of Agriculture Faisalabad (UAF)
  - University of Peshawar (UoP)
  - Government College University Faisalabad (GCUF)
- **💬 Dual Consultation Experience**:
  - **Academic Portal (`index.html`)**: Fast, elegant single-page landing site featuring dynamic typewriter headline, interactive campus chips, and advisory domains.
  - **Full-Window Chat Desk (`chat.html`)**: Broad-screen consultation workspace featuring formatted Markdown replies, dynamic table rendering, copy utilities, and query regeneration.
- **⚡ Bilingual Roman Urdu & English Support**: Understands student queries phrased colloquially, in Latin-script Urdu, or standard English.
- **🛡️ Anti-Hallucination Grounding**: Specifically instructed to prioritize official retrieved context over speculation. When specific data is absent, it transparently refers students to respective university admission offices.
- **📱 Responsive & Accessible**: Optimized for mobile screens, tablets, and wide desktop displays without heavy external framework bloat.

---

## 🏗️ Architecture

```
[ Student / User ]
       │
       ▼
[ CampusAI Frontend (HTML5 / CSS3 / ES6) ]
       │
       ▼ (POST chatInput + sessionId)
[ n8n Webhook Node ]
       │
       ├─► [ JavaScript University Intent Classifier ]
       │
       ├─► [ Cohere Multilingual v3.0 Embeddings ]
       │         │
       │         ▼
       ├─► [ Pinecone Vector Store (Top-K Similarity Retrieval) ]
       │
       ├─► [ Groq Chat Model / GPT-OSS 120B LLM ]
       │         │
       │         ▼
       └─► [ Respond to Webhook (Sanitized Markdown Text) ]
```

---

## 📁 Repository Structure

```plaintext
campusai/
├── css/
│   ├── style.css              # Main portal design tokens & styles
│   └── chat.css               # Dedicated consultation workspace styles
├── js/
│   ├── chat.js                # Core frontend client & webhook dispatcher
│   └── config.example.js      # Configuration template with placeholder webhook
├── CampusAI_workflow.json     # Sanitized n8n RAG pipeline template
├── chat.html                  # Full-window academic advisory chat page
├── favicon.svg                # Academic crest brand mark
├── index.html                 # Main landing portal with animated headline
├── .gitignore                 # Strict rules ignoring secrets & deployment builds
└── README.md                  # Project documentation & setup guide
```

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/MuhaammadAbubakar/CampusAI.git
cd CampusAI
```

### 2. Configure Your Webhook Endpoint
Copy the configuration template:
```bash
cp js/config.example.js js/config.js
```

Open `js/config.js` and enter your n8n webhook URL:
```javascript
window.CAMPUS_CONFIG = {
  WEBHOOK_URL: "https://your-n8n-instance.domain/webhook/your-webhook-id"
};
```
*(Note: `js/config.js` is automatically excluded by `.gitignore` so your private endpoint is never committed).*

### 3. Run Locally
Run any local static HTTP server:
```bash
# Using Python 3:
python -m http.server 8000

# Or using Node.js:
npx serve .
```
Navigate to `http://localhost:8000` in your web browser.

---

## 🤖 Importing the n8n RAG Workflow

1. Open your self-hosted or cloud **n8n** instance.
2. Click **Add workflow** > **Import from File**.
3. Select `CampusAI_workflow.json` from the repository.
4. Configure your credentials inside n8n:
   - **Cohere API**: For `embed-multilingual-v3.0` document and query embeddings.
   - **Pinecone API**: For vector storage and top-K similarity search.
   - **Groq API**: For high-speed LLM inference.
5. In the **Webhook** node:
   - Copy the generated Webhook Production URL.
   - Update `allowedOrigins` with your deployment domain (e.g., `https://your-domain.com`).
6. Activate the workflow.

---

## 🌐 Deploying to InfinityFree

To deploy the frontend to free hosting platforms such as **InfinityFree** or any standard shared host:

1. InfinityFree uses a single root `htdocs/` folder.
2. A pre-packaged standalone file `deploy_infinityfree.html` can be generated with all inline styles and scripts.
3. Rename your desired file to `index.html` and upload it directly into the `htdocs/` directory via FileZilla FTP or the InfinityFree File Manager.
4. Ensure your n8n Webhook node allows requests from your InfinityFree domain in CORS settings (`allowedOrigins`).

---

## 🔒 Security Best Practices

- **Zero Hardcoded Secrets**: All live webhook endpoints, API keys, and internal workflow IDs are kept out of version control.
- **DOM Sanitization**: Chat responses are parsed via `marked.js` and sanitized using `DOMPurify` to defend against XSS attacks.
- **Origin Validation**: n8n Webhook node restricts invocation to authorized host domains.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
Academic trademarks, emblems, and university prospectuses belong to their respective statutory bodies.
