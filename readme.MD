# 🛒 Ecommerce Backend API

Questo progetto è un backend API completo per una piattaforma e-commerce. È sviluppato con **Node.js**, **Express** e **MongoDB**, e include funzionalità per la gestione di utenti, prodotti, ordini e pagamenti Stripe.

---

## 🧰 Tecnologie utilizzate

- **Node.js** con **Express**
- **MongoDB** + **Mongoose**
- **JWT** per autenticazione
- **Stripe API** per pagamenti
- **Multer** per upload immagini
- **Sharp** per compressione immagini
- **Day.js** per gestione date
- **Nodemailer** o SendGrid per invio email
- **Winston** per logging
- **dotenv**, **helmet**, **xss-clean**, **rate-limit**, ecc. per sicurezza

---

## 📦 Funzionalità principali

### 🧑‍💼 Gestione utenti

- Registrazione e login con JWT
- Logout e gestione token
- Modifica profilo e indirizzo
- Soft delete (disattivazione account)
- Verifica email via token
- Pannello admin: gestione utenti, filtro per cognome, paginazione

### 📦 Gestione prodotti

- CRUD prodotti (con supporto immagini)
- Attivi/inattivi
- Ricerca e filtro per categoria / packSize / formato
- Slug generati automaticamente
- Upload immagini compressi via Multer + Sharp

### 📈 Statistiche ordini

- Fatturato per range: 7 giorni / 1 mese / 1 anno
- Top 5 prodotti più venduti
- Stato attuale ordini (paid, pending, ecc.)
- Dashboard admin con dati aggregati

### 💳 Pagamenti con Stripe

- Creazione di `PaymentIntent`
- Webhook per ricezione conferma di pagamento
- Cambio stato ordine al pagamento riuscito
- Invio email di conferma ordine

### 🛡 Sicurezza

- Rate limit contro bruteforce
- Sanificazione input (XSS, NoSQL injection)
- Headers sicuri con Helmet
- CORS configurabile
- Cookie HttpOnly + JWT
