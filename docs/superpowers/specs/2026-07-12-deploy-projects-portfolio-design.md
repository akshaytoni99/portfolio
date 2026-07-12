# Deploy Streamlit Projects + Portfolio Cards — Design

Date: 2026-07-12
Status: approved (user said continue)

## Goal

Deploy every deployable (Streamlit) app in akshaytoni99's GitHub account to Streamlit
Community Cloud, then add all worthwhile projects as cards on the portfolio site —
live-demo link where deployed, GitHub link otherwise.

## Decisions (user-confirmed)

1. **Scope:** Streamlit apps deployed + cards for all worthwhile projects
   (including notebook-only ML repos as GitHub-link cards). Portfolio Render/Supabase
   backend deploy is OUT of scope.
2. **Platform:** Streamlit Community Cloud (share.streamlit.io), free tier.
3. **Portfolio mechanism:** edit `src/content/seeds.js` directly, commit + push.
   CMS can override later once backend deploys.

## Deploy candidates (verify each has a real Streamlit app)

| Repo | Main file (expected) | Key input | Note |
|---|---|---|---|
| OpenAI-Ollama-Chatbot | `2-OpenAI Chatbot/app.py` | OpenAI key sidebar | Ollama app NOT deployable (local Ollama) — deploy OpenAI app only |
| LangChain-Search-Engine-Agent | `5-Search Engine/app.py` | Groq key sidebar | needs requirements.txt check |
| InsightStream-AI-LLM-Powered-Web-YouTube-Summarization-System | `app.py` | Groq key sidebar | |
| LLM-Powered-SQL-Database-Chatbot-using-LangChain-and-Streamlit | verify | Groq key sidebar | |
| PDF-Query-RAG-System-with-LangChain-AstraDB | verify | AstraDB creds | if creds required at boot → card-only |
| Smart-Web-Data-Miner-with-LLM-Based-Content-Processing | verify | verify | |
| Multi-Agent-AI-Applications-with-LangGraph | verify | verify | |

Card-only (no app): CNN-Recyclable-Materials (+_deployment), Regression-Life-Expectancy,
ANN-Customer-Churn, Apple-Quality, Hate-Speech-Detection, Next-Word-LSTM,
Tweet-Sentiment-RNN, Crew-AI-Crash-Course, E-Commerce-Store-Analysis, Electricityprice.

Excluded entirely: Resume, My-dataset, My-personal, SQL-project, Knowledge_transfer,
Nanmudhalvan, akshaytoni99 (profile), claude-certified-architect (fork),
edpsych-chatbot (already deployed — card may still be added with existing Vercel URL),
portfolio itself.

## Architecture / flow

1. **Prep commits per repo:** ensure `requirements.txt` with pinned-enough deps;
   no restructure — Streamlit Cloud accepts nested main-file paths.
2. **Deploy loop (Playwright):** share.streamlit.io → sign in with GitHub (browser
   session already authenticated) → authorize OAuth once → per app: New app →
   repo/branch/main-path → Deploy → wait for build → capture `*.streamlit.app` URL.
3. **Record:** set each repo's GitHub homepage to its live URL (`gh api PATCH`).
4. **Portfolio:** extend `projects` array in seeds.js — title, one-liner, tech tags,
   github URL, live URL (deployed only). Commit + push.

## Error handling

- Build failure → read Streamlit Cloud logs, fix requirements.txt, redeploy once;
  if still failing → card-only, note reason.
- App requires unavailable external service (Ollama, AstraDB without creds) → card-only.
- No dead demo links on the portfolio.

## Verification

- Each deployed URL loads the app UI (not Streamlit error page).
- Portfolio renders locally (`npm run dev`), cards show correct links.
- seeds.js pushed; GitHub homepage fields set.

## Security

- No API keys committed anywhere; apps use sidebar key input (visitor brings key).
- Owner can later add own keys via Streamlit Cloud secrets per app.
