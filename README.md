# 🧠 SmartDictionary — AI-Powered Chrome Extension

<p align="center">
  <a href="#-english-version">🇺🇸 English</a> |
  <a href="#-versão-em-português">🇧🇷 Português</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/STATUS-IN%20DEVELOPMENT-3b82f6?style=for-the-badge&labelColor=111827" />
  <img src="https://img.shields.io/badge/TYPE-CHROME%20EXTENSION-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white&labelColor=111827" />
  <img src="https://img.shields.io/badge/JAVASCRIPT-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black&labelColor=111827" />
  <img src="https://img.shields.io/badge/AI-GOOGLE%20GEMINI-8E75B2?style=for-the-badge&logo=google&logoColor=white&labelColor=111827" />
  <img src="https://img.shields.io/badge/OCR-ENABLED-22c55e?style=for-the-badge&labelColor=111827" />
</p>
---

# 🇺🇸 English Version

## 📌 Overview

SmartDictionary is a Chrome Extension that enhances the browsing experience by providing instant AI-powered definitions and OCR-based text extraction directly on any webpage.

It integrates Google Generative AI models to deliver contextual explanations and allows follow-up interactions via an inline chat interface.

---

## 🚀 Features

- 📖 Context-aware word definitions on text selection
- 💬 Embedded quick chat for follow-up questions
- 🖼 OCR text extraction from images
- 🔐 Secure API key storage using `chrome.storage.sync`
- ⚙️ Background Service Worker architecture
- 📦 Automated build system with version synchronization

---

## 🛠 Tech Stack

- JavaScript (ES6+)
- Chrome Extension APIs
- Google Generative AI (`@google/genai`)
- OCR Processing
- Node.js & npm (build system)

---

## 🏗 Project Structure

```text
├── background.js        # Service worker
├── scripts/             # Core logic (API, OCR, UI balloon, prompts)
├── popup/               # Extension popup interface
├── dist/                # Bundled content scripts
├── manifest.json        # Extension configuration
└── package.json         # Build scripts & dependencies
```

---

## ⚙️ Installation (Local Development)

### 1️⃣ Clone repository

```bash
git clone https://github.com/Ywtoo/SmartDictionary.git
cd SmartDictionary
```

### 2️⃣ Install dependencies and build

```bash
npm install
npm run build
```

### 3️⃣ Load into Chrome

- Open `chrome://extensions/`
- Enable **Developer Mode**
- Click **Load unpacked**
- Select the project folder

> Important: during development this extension should be loaded in **Developer Mode** using "Load unpacked". If you're developing, run `npm run build` before loading so `dist/` matches `manifest.json`.

If you just want to install the extension without building the project, download a release ZIP (from the project's Releases page), extract it and use **Load unpacked** on the extracted folder (it must include `manifest.json` and a `dist/` folder with built files).

---

## 🔑 API Configuration

Set your Google Generative AI API Key:

- Configure `apiKey` via extension settings
- Or store it using `chrome.storage.sync`

> Note: Some models may require access permissions.

---

## 🧪 Development Scripts

- `npm run build` → Generates bundles and syncs version with `manifest.json`
- `npm run ver` → Syncs version between `manifest.json` and `package.json`

---

## 📦 Release

Production-ready builds are available in the **Releases** section.

---

## 📜 License

See `LICENSE` for details.

---

## 👨‍💻 Author

Gabriel Nascimento

# 🇧🇷 Versão em Português

## 📌 Visão Geral

O SmartDictionary é uma extensão para o Google Chrome que melhora a experiência de navegação fornecendo definições instantâneas alimentadas por IA e extração de texto de imagens (OCR) diretamente em qualquer página.

A extensão integra modelos generativos do Google para fornecer explicações contextuais e permite interações adicionais por meio de um chat embutido.

---

## 🚀 Funcionalidades

- 📖 Definição contextual ao selecionar palavras
- 💬 Chat embutido para perguntas de acompanhamento
- 🖼 Extração de texto de imagens (OCR)
- 🔐 Armazenamento seguro da API Key usando `chrome.storage.sync`
- ⚙️ Arquitetura baseada em Service Worker
- 📦 Sistema de build com sincronização de versão

---

## 🛠 Tecnologias

- JavaScript (ES6+)
- APIs de Extensão do Chrome
- Google Generative AI (`@google/genai`)
- OCR
- Node.js & npm (sistema de build)

---

## 🏗 Estrutura do Projeto

```text
├── background.js        # Service worker
├── scripts/             # Lógica central (API, OCR, UI balloon, prompts)
├── popup/               # Interface do popup da extensão
├── dist/                # Scripts empacotados
├── manifest.json        # Configuração da extensão
└── package.json         # Scripts de build e dependências
```

---

## ⚙️ Instalação (Desenvolvimento Local)

### 1️⃣ Clonar repositório

```bash
git clone https://github.com/Ywtoo/SmartDictionary.git
cd SmartDictionary
```

### 2️⃣ Instalar dependências e build

```bash
npm install
npm run build
```

### 3️⃣ Carregar no Chrome

- Abra `chrome://extensions/`
- Ative **Developer Mode**
- Clique em **Load unpacked**
- Selecione a pasta do projeto

> Importante: durante o desenvolvimento esta extensão deve ser carregada em **Developer Mode** usando "Load unpacked". Se quiser apenas instalar a extensão sem compilar o projeto, baixe o ZIP da seção **Releases**, extraia e use **Load unpacked** na pasta extraída (ela deve conter `manifest.json` e a pasta `dist/` com os arquivos construídos).

## 🔑 Configuração da API

Defina sua Google Generative AI API Key:

- Configure `apiKey` via configurações da extensão
- Ou armazene usando `chrome.storage.sync`

> Obs: Alguns modelos podem requerer permissões de acesso na sua conta.

---

## 🧪 Scripts de Desenvolvimento

- `npm run build` → Gera os bundles e sincroniza a versão com `manifest.json`
- `npm run ver` → Sincroniza a versão entre `manifest.json` e `package.json`

---

## 📦 Release

Builds prontos para produção estão disponíveis na seção **Releases**.

---

## 📜 Licença

Consulte o arquivo `LICENSE` para mais detalhes.

---

## 👨‍💻 Autor

Gabriel Nascimento
