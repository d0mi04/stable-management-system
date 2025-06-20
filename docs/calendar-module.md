
# 📅 Kalendarz wydarzeń – Stable Management System

Moduł kalendarza w aplikacji Stable Management System umożliwia użytkownikom i administratorom zarządzanie wydarzeniami związanymi z końmi w przejrzystej i funkcjonalnej formie.

---

## 👤 Funkcjonalność dla użytkownika

Użytkownik po zalogowaniu do systemu ma dostęp do kalendarza zawierającego tylko wydarzenia przypisane do jego koni. Każdy użytkownik widzi wyłącznie informacje dotyczące jego własnych koni. Logika opiera się na identyfikatorze użytkownika (`userId`), który przypisany jest do koni w bazie danych.

### 🔍 Przeglądanie wydarzeń
- Wyświetlane są tylko wydarzenia przypisane do koni użytkownika.
- Dane są pobierane z bazy MongoDB na podstawie daty oraz `userId`.

### 🔄 Integracja z Google Calendar
- Użytkownik może **zaimportować wydarzenia** z własnego Google Calendar do aplikacji (wymaga logowania do Google).
- Możliwość **dodania wydarzenia do Google Calendar** bezpośrednio z aplikacji – użytkownik wybiera datę, godzinę i tytuł wydarzenia.

#### 🔐 Autoryzacja

Logowanie i autoryzacja odbywa się przy użyciu:
- OAuth 2.0 (implicit flow)
- Biblioteki `@react-oauth/google`
- Trybu `ux_mode: redirect`

#### 📥 Pobieranie wydarzeń

Po uzyskaniu tokenu (`access_token`) wykonywane jest zapytanie:

```
GET https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=2500
```

Pobrane wydarzenia są filtrowane i mapowane do lokalnego widoku kalendarza. Wydarzenia lokalne i z Google Calendar są prezentowane obok siebie, umożliwiając porównanie i synchronizację.

#### ➕ Dodawanie wydarzeń

Nowe wydarzenia są wysyłane poprzez zapytanie:

```
POST https://www.googleapis.com/calendar/v3/calendars/primary/events
```

Zawierające m.in.:
- `summary`
- `start.dateTime`
- `end.dateTime`
- `timeZone` (domyślnie: `Europe/Warsaw`)

#### ⚠️ Obsługa błędów

System obsługuje błędy:
- logowania
- komunikacji z Google API
- komunikacji z lokalnym API

W przypadku braku autoryzacji użytkownik otrzymuje stosowny komunikat.

---

## 🛠️ Funkcjonalność dla administratora

Administrator posiada rozszerzone możliwości zarządzania kalendarzem i wydarzeniami:

### ➕ Dodawanie wydarzeń
- Administrator wybiera konia, datę oraz opis wydarzenia.
- Po dodaniu:
  - Wydarzenie zostaje zapisane w bazie MongoDB.
  - Wysyłany jest **automatyczny e-mail** do właściciela konia z informacją o nowym wydarzeniu.

## ✉️ Funkcjonalność: Wysyłanie e-maili po utworzeniu nowego wydarzenia

Po dodaniu nowego wydarzenia system automatycznie wysyła e-mail do właściciela konia (`ownerEmail` z kolekcji `horses`).

#### 📬 Przebieg działania

1. Wybór konia (`selectedHorseId`)
2. Odczyt danych konia:
   ```js
   const selectedHorse = horses.find(h => h._id === selectedHorseId);
   const email = selectedHorse?.ownerEmail;
   const horseName = selectedHorse?.name;
   ```
3. Formatowanie daty:
   ```js
   const formattedDate = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
   ```
4. Wysłanie e-maila:
   ```js
   const emailUrl = `https://send-email-381376669818.europe-west1.run.app?email=...`
   ```

Wysyłka realizowana jest jako `fetch`, bez oczekiwania na odpowiedź. Błędy są obsługiwane w bloku `try-catch`.

#### 📧 Przykład wiadomości e-mail:
```
Tytuł: Nowe wydarzenie dla Twojego konia

Hejka,  
Twój koń Kasztan ma nowe wydarzenie dnia 17-06-2025  
Opis: test1234

Ihaaa!
```

### 🗑️ Usuwanie i podgląd wydarzeń
- Administrator może przeglądać wydarzenia dla każdego dnia i każdego konia.
- Wydarzenia można usuwać jednym kliknięciem.

### 🌤️ Pogoda
- W kalendarzu admina znajduje się również informacja o aktualnej pogodzie dla danego miejsca.

---

## 🔐 Autoryzacja
- Na etapie logowania ustalany jest `userId`, który decyduje o tym, jakie dane użytkownik ma prawo zobaczyć.
- Wysyłanie danych i integracja z Google Calendar wymaga autoryzacji przy pomocy konta Google (OAuth 2.0).

---

## 🧰 Technologie
- **Frontend**: React, dayjs, react-calendar, @react-oauth/google
- **Backend**: Node.js, Express
- **Baza danych**: MongoDB (MongoDB Atlas)
- **Inne**: Google Calendar API, Email trigger (Google Cloud Functions)

---

## 🛠 Dodatkowe endpointy API

Na potrzeby implementacji funkcjonalności kalendarza zostały dopisane poniższe endpointy w pliku `routes/events.js`:

### 🟢 GET /events/:date  
**Opis:** Pobiera wszystkie wydarzenia z podanej daty z wypełnionym `horseId` (lub samym ObjectId).  
**Dostępność:** Admin.  
**Autoryzacja:** JWT (`verifyToken`, `isAdmin`)  
**Przykład odpowiedzi:**
```json
[
  {
    "_id": "684dbb269b2300b1f9383518",
    "title": "test1234",
    "date": "Tue Jun 17 2025",
    "hour": "09:00",
    "location": "Warszawa",
    "duration": 1,
    "horseId": "684990e389044115154df118",
    "__v": 0
  },
  {
    "_id": "684dd54f9b2300b1f9383767",
    "title": "test4",
    "date": "Tue Jun 17 2025",
    "hour": "09:00",
    "location": "Warszawa",
    "duration": 1,
    "horseId": "684990e389044115154df118",
    "__v": 0
  }
]
```

### 🟢 GET /events/:date/:ownerId
**Opis:** Pobiera wydarzenia dla koni przypisanych do właściciela ```ownerId``` z podanej daty.  
**Dostępność:** User.  
**Autoryzacja:** Opcjonalna (np. JWT).
**Przykład odpowiedzi:** Analogiczna do powyższej, ale filtrowana po ```ownerId```.

### 🟡 POST /events
**Opis:** Dodaje nowe wydarzenie dla konkretnego konia (```horseId```).  
**Dostępność:** Admin.  
**Autoryzacja:** JWT (`verifyToken`, `isAdmin`)
**Body:** 
```json
{
  "title": "Nowe wydarzenie",
  "date": "Tue Jun 17 2025",
  "hour": "09:00",
  "location": "Warszawa",
  "duration": 1,
  "horseId": "684990e389044115154df118"
}
```
**Odpowiedź:**
```json
{
  "_id": "noweId123",
  "title": "Nowe wydarzenie",
  "date": "Tue Jun 17 2025",
  "hour": "09:00",
  "location": "Warszawa",
  "duration": 1,
  "horseId": "684990e389044115154df118",
  "__v": 0
}
```

### 🔴 DELETE /events/:id
**Opis:** Usuwa wydarzenie o danym ```id```.  
**Dostępność:** Admin.  
**Autoryzacja:** JWT (`verifyToken`, `isAdmin`)
**Odpowiedź:** 
```json
{
  "message": "Wydarzenie usunięte"
}
```

---

## ☁️ Funkcja serverless

E-maile są wysyłane przez funkcję backendową w chmurze (Google Cloud Functions), napisaną w Pythonie z użyciem `smtplib`.

Wymagane było:
- Ustawienie weryfikacji dwuetapowej
- Wygenerowanie hasła aplikacji (app password)

---

## 💾 Funkcjonalność: Local Storage (przechowywanie danych użytkownika)

Po zalogowaniu dane użytkownika (ID i imię) są zapisywane w Local Storage:

```js
localStorage.setItem("userId", user.userId);
localStorage.setItem("userName", user.username);
```

### 👤 Personalizacja UI

Dzięki zapisanym danym możliwe jest:

- Wyświetlenie powitania:
  ```js
  const username = localStorage.getItem("userName");
  ```
  ```jsx
  <h2>Witaj, {username}!</h2>
  ```

- Ograniczenie dostępu do danych w kalendarzu
- Przekierowanie na podstawie roli:
  ```js
  if (user.role === "admin") {
    navigate("/admin");
  }
  ```

### ⚠️ Uwagi dotyczące bezpieczeństwa

- Dane w Local Storage nie są szyfrowane
- Powinny zawierać wyłącznie informacje niepoufne

---
