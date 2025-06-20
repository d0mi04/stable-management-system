# 🐴✨ Stable Guard – Aplikacja do zarządzania stajnią ✨🐴

Stable Guard to pełna aplikacja służąca do zarządzania końmi, boksami, personelem oraz innymi zasobami stajni. Projekt oparty jest na Node.js, Express oraz MongoDB (backend).

---
## 🚀 Jak uruchomić projekt lokalnie

Szczegółowa instrukcja jak pobrać i uruchomić aplikację na swoim komputerze.

### 📦 Wymagania wstępne

- [Node.js](https://nodejs.org/) - zalecana wersja: LTS, np. `18.x`
- [npm](https://www.npmjs.com/) – instalowany razem z Node.js
- Konto na [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) lub lokalnie zainstalowany serwer MongoDB

---
## 🛠️ Instalacja krok po kroku

### 1. Sklonuj repozytorium z GitHuba

```bash
git clone https://github.com/d0mi04/stable-management-system.git
```
### 2. Przejdź do katalogu projektu

```bash
cd stable-manager
```
### 3. Zainstaluj zależności - backend

```bash
cd .\server\server\
npm init -y
npm install express mongoose cors dotenv bcrypt jsonwebtoken --save-dev nodemon
```
### 4. Zainstaluj zależności - frontend

```bash
cd .\client\client\
npm install 
```

---

## 🔐 Plik `.env`

Utwórz plik `.env` w katalogu `\server\server` i dodaj do niego poniższe zmienne środowiskowe:

```bash
PORT=5000
MONGODB_URI=?
JWT_SECRET=?
```
Utwórz plik środowiskowy `.env` w katalogu `client\client` i dodaj do niego poniższe zmienne środowiskowe:

```bash
REACT_APP_API_URL=http://localhost:5000/
REACT_APP_OPENWEATHER_API_KEY=?
REACT_APP_CLIENT_ID=?
```

---
## ▶️ Uruchomienie aplikacji
### 🧠 Backend

```bash
npm run dev
```
### 💅 Frontend
```bash
npm start
```

---

## 📚 Główne funkcjonalności

- Rejestracja i logowanie użytkowników
- Autoryzacja z JWT
- Zarządzanie końmi (dodawanie, edytowanie, przypisywanie boksu)
- Zarządzanie boksami (statusy: wolny/zajęty)
- Role użytkowników: admin i zwykły użytkownik
- Obsługa błędów i zabezpieczeń

---

## 🧪 Testowanie API

Możesz testować endpointy za pomocą narzędzi takich jak:

- [Postman](https://www.postman.com/)

---

## 📁 Struktura katalogów

```
stable-management-system/
│
├──  🗂️ client/
│   └──  🗂️ client/
│       ├──  🗂️ public/
│       └──  🗂️ src/
│           ├──  🗂️ components/        # Komponenty UI
│           ├──  🗂️ context/           # Konteksty Reacta
│           ├──  🗂️ pages/             # Widoki/strony aplikacji
│           ├── App.js             # Główny komponent aplikacji
│           ├── index.js           # Punkt wejściowy React
│           └── index.css
│       ├── .env           
│       ├── README.md              
│       ├── package.json           
│       └── tailwind.config.js     # Konfiguracja Tailwinda
│
├──  🗂️ docs/                          
│   ├── auth-system.md
│   ├── calendar-module.md
│   ├── horse-module.md
│   ├── stable-module.md
│   └── weather-integration.md
│
├──  🗂️ server/
│   └──  🗂️ server/
│       ├──  🗂️ controllers/           # Logika obsługi endpointów
│       ├──  🗂️ middleware/            # Middleware do autoryzacji
│       ├──  🗂️ models/                # Modele Mongoose - schema
│       ├──  🗂️ routes/                # Definicje tras API
│       ├── server.js              # Główny plik uruchamiający backend (Express + MongoDB)
│       ├── seed.js                
│       ├── .env                   
│       ├── .gitignore
│       ├── LICENSE
│       └── README.md              
│
├── package.json                   
└── README.md                    

```

---

## 👩‍💻 Technologie

- Node.js
- Express.js
- MongoDB (Mongoose)
- JSON Web Tokens (JWT)
- dotenv
- bcryptjs
- tailwind
- CSS

---

## 🧑‍💼 Autorzy

~~Projekt stworzony na potrzeby uzyskania zaliczenia z przedmiotu Zaawansowane Techniki Internetowe.~~

Projekt stworzony z miłości do koników. 🦄💜

---

## 📜 Licencja

Projekt dostępny na licencji MIT.
