# 🌿 Breathe ESG Frontend

Modern React-based ESG emissions dashboard for ingesting, reviewing, and auditing enterprise sustainability data.

Built with React 18, Vite, Axios, and a responsive analyst workflow UI. Connects to the Django REST backend to manage SAP, utility, and corporate travel emissions data normalized into kgCO₂e.

## Features

* 📊 Real-time ESG dashboard & emissions summary
* 📁 File ingestion interface for SAP, utility, and travel datasets
* ✅ Analyst review & approval workflow
* 🔒 Immutable audit trail support
* ⚡ Fast Vite-powered frontend
* 🌐 REST API integration with Django backend
* 📱 Responsive and clean UI components

## Tech Stack

* React 18
* Vite
* Axios
* REST API integration
* CSS / Component-based architecture

## Development

```bash
npm install
npm run dev
```

Runs locally on:

```text
http://localhost:5173
```

Backend API expected at:

```text
http://localhost:8000/api
```

Configure API URL using:

```env
VITE_API_URL=http://localhost:8000/api
```
