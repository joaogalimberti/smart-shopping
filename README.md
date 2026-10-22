<div align="center">

# 🫒 Oliva

**A simple shopping list that keeps up with you.**

Register products, check items off as you shop, and send the finished list to the server.

<br />

[![Demo](https://img.shields.io/badge/demo-online-6B8E23?style=for-the-badge&logo=githubpages&logoColor=white)](https://joaogalimberti.github.io/shopping-list-system/)
[![JavaScript](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](#-structure)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/academic_project-6B8E23?style=for-the-badge)](#-academic-context)

<br />

[**Live demo**](https://joaogalimberti.github.io/smart-shopping/) · [Quick start](#-quick-start) · [Features](#-features) · [Structure](#-structure)

</div>

<br />

## ◆ About

Oliva is a shopping list app built for the **Web Technology** course. It covers full CRUD, offline persistence, and REST API integration using only **HTML, CSS, and vanilla JavaScript**, with Vite as the dev tooling.

On desktop it runs inside a smartphone frame; on mobile it goes full screen.

<br />

## ◆ Quick start

```bash
git clone https://github.com/joaogalimberti/shopping-list-system.git
cd shopping-list-system
npm install
npm run dev
```

Then open the local URL printed in the terminal.

<br />

## ◆ Features

| | Feature | What it does |
|:-:|---|---|
| 📝 | **Product CRUD** | Create, edit, and delete products with name, unit, quantity, and optional EAN-13 barcode |
| 🔢 | **Auto ID** | Sequential product codes that stay unique, even after deletions |
| ✅ | **Validation** | Required fields and format checks on every form |
| 🛒 | **Shopping list** | Stays in sync with the catalog, with +/− and manual quantity controls |
| ✔️ | **Auto-complete** | Items are marked as collected when the target quantity is reached |
| 📤 | **Server submission** | Sends the whole list to the API in one go, once everything is collected |
| 🕘 | **History** | Keeps a log of every submission |
| 🪄 | **Smart import** | Turns a pasted list into products automatically |
| 💡 | **Tutorial** | Built-in walkthrough for first-time users |

<br />

## ◆ How it works

```mermaid
graph LR
    A[Register products] --> B[(LocalStorage)]
    B --> C[Shopping list]
    C --> D[All collected]
    D --> E[REST API]
    E --> F[History]
```

| Storage key | Purpose |
|---|---|
| `listaProdutos` | Product catalog |
| `listaCompras` | Current shopping list |
| `historicoEnvios` | Submission history |

| Endpoint | Purpose |
|---|---|
| `/Compras` | Shopping records |
| `/Compras/{id}/produtos` | Items of each record |

<br />

## ◆ Structure

```
oliva/
├── index.html          Product catalog page
├── lista.html          Shopping list page
├── app.js              Catalog logic and validation
├── list.js             Shopping list and API submission
├── storage.js          LocalStorage layer
├── smartParser.js      List parsing
├── magicImporter.js    Smart import
├── tutorial.js         Onboarding walkthrough
├── icons.js            Icon set
├── styles.css          Styling
└── vite.config.js      Vite config
```

<br />

## ◆ Commands

| Command | Description |
|---|---|
| `npm run dev` | Starts the dev server |
| `npm run build` | Builds for production into `dist` |

Deployment runs automatically through GitHub Actions (`.github/workflows`).

<br />

## ◆ Academic context

| | |
|---|---|
| **Program** | Systems Analysis and Development |
| **Course** | Web Technology |
| **Institution** | UCL University |
| **Year** | 2025 |

<br />

<div align="center">

Made by [João Galimberti](https://github.com/joaogalimberti) · [LinkedIn](https://www.linkedin.com/in/joaogalimberti/) · [Email](mailto:joaogalimberti@gmail.com)

</div>
