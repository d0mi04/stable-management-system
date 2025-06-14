# 🔒 AUTH ROUTES - (`/auth`)

## 🟢 POST /auth/register

 - **Opis:** Rejestracja nowego użytkownika.
 - **Dostępność:** Publiczna (bez tokenu).
 - **Body (JSON):**

 ```json
 {
    "email": "user@example.com",
    "username": "User",
    "password": "userPassword123"
}
```
 - **Odpowiedź:**
 ```json
 {
    "message": "🍏 User registered successfully!"
}
```

✅ Wskazówka: po udanej rejestracji można automatycznie zalogować użytkownika lub przekierować go do formularza logowania.

## 🟢 POST /auth/login

 - **Opis:** Logowanie użytkownika i zwrócenie tokenu JWT.
 - **Dostępność:** Publiczna
 - **Body (JSON):**

 ```json
 {
    "email": "user@example.com",
    "password": "userPassword123"
}
```
 - **Odpowiedź:**
 ```json
 {
    "message": "🍏 Login successful!",
    "userId": "...",
    "username": "...",
    "token": "Bearer JWT_TOKEN"
}
```

✅ Wskazówka: Należy zapisać token w `localStorage` lub `sessionStorage` i dodawać do nagłówka `Authorization` w dalszych requestach jako: 
```
Authorization: Bearer JWT_TOKEN
```