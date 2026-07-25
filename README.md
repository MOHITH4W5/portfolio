# 🎯 AI/ML Portfolio Project

<div align="center">

[![GitHub Portfolio](https://img.shields.io/badge/Portfolio-Live-brightgreen?style=flat-square&logo=github)](https://mohith4w5.github.io/portfolio)
[![Deployment](https://img.shields.io/github/deployments/MOHITH4W5/portfolio/github-pages?style=flat-square)](https://mohith4w5.github.io/portfolio)
[![GitHub last commit](https://img.shields.io/github/last-commit/MOHITH4W5/portfolio?style=flat-square&logo=github)](https://github.com/MOHITH4W5/portfolio/commits/main)

**A sleek, modern portfolio website showcasing AI/ML projects and professional accomplishments**

[View Live Site](https://mohith4w5.github.io/portfolio) • [Report Bug](https://github.com/MOHITH4W5/portfolio/issues) • [Request Feature](https://github.com/MOHITH4W5/portfolio/issues)

</div>

---

## Free RAG AI Assistant Setup

This portfolio includes a floating AI assistant that keeps GitHub Pages free and uses a free Cloudflare Worker to hide API keys.

### Architecture

- **Frontend:** `ai-chat.js` adds the floating chat widget to the static GitHub Pages site.
- **API layer:** `worker/src/index.js` runs on Cloudflare Workers and exposes `POST /chat`.
- **Vector store:** Qdrant Cloud stores portfolio knowledge chunks in the `mohith_portfolio` collection.
- **Models:** Gemini creates embeddings with `gemini-embedding-001` and answers with `gemini-3.5-flash-lite`.
- **Knowledge base:** Markdown files in `knowledge/` are embedded by `scripts/ingest-knowledge.js`.

### 1. Create Free Accounts

1. Create a Gemini API key in Google AI Studio.
2. Create a free Qdrant Cloud cluster and API key.
3. Create a free Cloudflare account for Workers.

### 2. Ingest Portfolio Knowledge

Update `knowledge/mohith.md` with resume, projects, skills, and bio details, then run:

```powershell
$env:GEMINI_API_KEY="your-gemini-api-key"
$env:QDRANT_URL="https://your-qdrant-cluster-url"
$env:QDRANT_API_KEY="your-qdrant-api-key"
$env:QDRANT_COLLECTION="mohith_portfolio"
npm run ingest:knowledge
```

### 3. Deploy the Cloudflare Worker

```powershell
cd worker
Copy-Item wrangler.toml.example wrangler.toml
npm install
npx wrangler login
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put QDRANT_URL
npx wrangler secret put QDRANT_API_KEY
npx wrangler deploy
```

After deployment, Cloudflare prints a Worker URL such as:

```text
https://mohith-portfolio-ai.YOUR_SUBDOMAIN.workers.dev
```

### 4. Connect GitHub Pages to the Worker

In `index.html`, replace the placeholder endpoint:

```html
<script src="ai-chat.js" data-endpoint="https://mohith-portfolio-ai.YOUR_SUBDOMAIN.workers.dev/chat"></script>
```

with the actual deployed Worker `/chat` URL. Keep the Gemini and Qdrant keys only in Cloudflare Worker secrets.

### 5. Test Questions

- Known: "What projects has Mohith built?"
- Known: "What AI/ML skills does he have?"
- Known: "How can I contact him?"
- Unknown: "What is his GPA?" The assistant should say the portfolio does not mention that yet.

---

## 📋 Table of Contents
- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Customization](#customization)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🚀 About

This portfolio website is a comprehensive showcase of AI/ML engineering projects, skills, and professional experience. Built with modern web technologies, it provides an interactive and engaging way to explore my work in:

- **Generative AI & LLMs** - Fine-tuning transformers, prompt engineering, RAG systems
- **Machine Learning** - Model development, optimization, and deployment
- **Privacy-First AI** - Offline models, edge computing, data privacy
- **Full-Stack ML** - End-to-end pipelines from data to production

---

## ✨ Features

- 🎨 **Modern Dark Theme** - Professional, eye-catching design
- 📱 **Fully Responsive** - Works seamlessly on all devices
- ⚡ **Fast & Lightweight** - Optimized performance
- 🎯 **Project Cards** - Interactive showcase of all projects
- 🔗 **Social Integration** - Direct links to GitHub, LinkedIn, and email
- 📊 **GitHub Stats** - Real-time contribution statistics
- 🎬 **Smooth Animations** - Engaging user experience

---

## 🛠️ Tech Stack

```
📱 Frontend:      HTML5, CSS3, JavaScript (ES6+)
🎨 Styling:       Custom CSS, Responsive Design
📦 Deployment:    GitHub Pages
🔄 CI/CD:         GitHub Actions
```

---

## 📁 Project Structure

```
portfolio/
├── index.html          # Main portfolio page
├── style.css           # Styling and animations
├── script.js           # Interactive functionality
├── profile.jpg         # Profile picture
├── hero-bg.jpg         # Hero section background
├── .github/
│   └── workflows/      # GitHub Actions workflows
└── README.md           # This file
```

---

## 🎯 Getting Started

### Prerequisites
- Git
- A modern web browser
- Basic knowledge of HTML/CSS/JavaScript (for customization)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MOHITH4W5/portfolio.git
   cd portfolio
   ```

2. **Open locally** (optional)
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Or using Node.js
   npx http-server
   ```

3. **Visit in browser**
   ```
   http://localhost:8000
   ```

---

## 🎨 Customization

### Update Portfolio Information

1. **Edit `index.html`** - Update name, bio, skills, and projects
2. **Replace Images** - Add your own `profile.jpg` and `hero-bg.jpg`
3. **Update Social Links** - Modify email, LinkedIn, and GitHub URLs
4. **Customize Styling** - Edit `style.css` for theme and colors
5. **Add Interactivity** - Enhance `script.js` with additional features

### Key Sections to Customize

```html
<!-- Update your name and title -->
<h1>Your Name</h1>
<p class="tagline">Your Professional Title</p>

<!-- Add your projects -->
<div class="project-card">
    <h3>Project Title</h3>
    <p>Project description</p>
</div>

<!-- Update social links -->
<a href="https://linkedin.com/in/yourprofile">LinkedIn</a>
```

---

## 📤 Deployment

### Deploy to GitHub Pages (Free & Easy)

1. **Enable GitHub Pages**
   - Go to Settings → Pages
   - Select "Deploy from a branch"
   - Choose `main` branch and `/root` folder
   - Save

2. **Access Your Portfolio**
   ```
   https://yourusername.github.io/portfolio
   ```

### Alternative Hosting Options

- **Netlify**: Drag & drop deployment, free SSL
- **Vercel**: Optimized for web projects
- **Cloudflare Pages**: Fast global distribution

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 📞 Get in Touch

- 📧 Email: your.email@example.com
- 💼 LinkedIn: [Your LinkedIn Profile](https://linkedin.com/in/yourprofile)
- 🐙 GitHub: [MOHITH4W5](https://github.com/MOHITH4W5)
- 🌐 Portfolio: [View Live](https://mohith4w5.github.io/portfolio)

---

<div align="center">

**Made with ❤️ by [Mohith](https://github.com/MOHITH4W5)**

⭐ If you found this portfolio helpful, please give it a star!

</div>
