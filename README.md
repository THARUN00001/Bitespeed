# Bitespeed Identity Reconciliation Task

This project is a backend service that resolves user identity by linking related contact information (email and phone number) across multiple data entries. It uses Node.js, Express, and PostgreSQL.

---

## 📌 Hosted URL

The backend is live and can be accessed at:

🔗 **POST Endpoint:** [`https://bitespeed-390r.onrender.com/identify`](https://bitespeed-390r.onrender.com/identify)

---

## 📂 GitHub Repository

Codebase available here:  
🔗 [`https://github.com/THARUN00001/Bitespeed`](https://github.com/THARUN00001/Bitespeed)

---

## 🚀 Endpoint Usage

### `POST /identify`

Reconciles the identity of a user based on the given email and/or phone number.

#### Request Body
```json
{
  "email": "user@example.com",
  "phoneNumber": "1234567890"
}
