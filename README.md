# 🏍️ LC Rider — LC SyncTech

[![Production Deployment](https://img.shields.io/badge/Deployment-Cloudflare%20Pages-success?style=for-the-badge&logo=cloudflarepages)](https://biker.lcsynctech.com/)
[![Tech Stack](https://img.shields.io/badge/Stack-React%2018%20%7C%20Vite%20%7C%20Capacitor-orange?style=for-the-badge&logo=react)](https://biker.lcsynctech.com/)
[![Realtime Backend](https://img.shields.io/badge/Backend-Supabase%20Realtime-emerald?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Payment Gateway](https://img.shields.io/badge/Payments-Wompi%20Bancolombia-blue?style=for-the-badge)](https://wompi.co)

> **"Salimos juntos, rodamos juntos, volvemos todos juntos a casa."**  
> Plataforma de telemetría de alta disponibilidad, navegación y convoy en tiempo real diseñada por y para motociclistas.

---

## ⚡ Características Principales

- 🗺️ **Convoy en Tiempo Real:** Visualización en vivo de cada piloto del grupo, radar de distancias y alertas de rezagados vía WebSockets (Supabase Realtime).
- 🎙️ **Alertas por Voz & Waze Style:** Instrucciones giro a giro y avisos de seguridad directamente en el intercomunicador Bluetooth del casco.
- 📱 **Cockpit HUD & Telemetría:** Tacómetro digital, velocímetro reactivo, odómetro de rodada y modo guantes con hitboxes de 48px+.
- 🔋 **Resiliencia en Carretera & Screen Wake Lock:** Mantiene la pantalla encendida en el soporte de manubrio y ofrece continuidad offline con GPS satelital en túneles.
- 💳 **Pagos Reales con Wompi:** Suscripciones Pro y Club integradas con PSE (todos los bancos de Colombia), Nequi y Tarjetas.
- 📲 **Multiplataforma:** PWA con auto-actualización en 1 clic y soporte nativo para Android (Capacitor).

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite
- **Navegación & Mapas:** Leaflet, OpenStreetMap, OSRM Routing Engine
- **Backend & Auth:** Supabase Auth (Google OAuth 2.0 & Email) + PostgreSQL + Realtime Channels
- **Pagos:** Widget Oficial de Wompi Colombia (Bancolombia)
- **Infraestructura:** Cloudflare Pages Global Edge Network (Alta Disponibilidad 99.99%)

---

## 🚀 Despliegue y CI/CD

El proyecto cuenta con integración continua (**CI/CD**):
- Cada commit en la rama `main` de GitHub dispara un build automático en **Cloudflare Pages** (`npm run build` → `dist/`) y se publica en **[https://biker.lcsynctech.com](https://biker.lcsynctech.com)**.
- El enrutamiento SPA (`public/_redirects`) y las cabeceras de seguridad HSTS, X-Frame-Options y Permissions-Policy (`public/_headers`) se aplican directamente en el edge de Cloudflare.

---

© 2026 **LC SyncTech** — *Tecnología inteligente que te respalda.*
