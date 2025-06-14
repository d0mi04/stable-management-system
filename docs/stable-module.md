# 🏘️ STABLE ROUTES - (`/stables`)

## 📣 Ogólne wskazówki:

 ✨ Wszystkie endpointy wymagają tokenu JWT i są dostępne wyłącznie dla Administratorów.

 ✨ Token JWT powinien być wysłany w nagłówku:
 ```makefile
 Authorization: Bearer JWT_TOKEN
```

## 🟢 GET /stables

 - **Opis:** Pobiera listę wszystkich stajni.
 - **Dostępność:** Admin.
 - **Autoryzacja:** JWT (verifyToken, isAdmin)
 - **Odpowiedź:**
 ```json
{
    "stables": [
        {
            "_id": "...",
            "fullName": "...",
            "location": "...",
            "capacity": "...",
            "description": "...",
            "stallArray": [...]
        },
        ...
    ]
}
```

## 🟢 GET /stables/:stableID

 - **Opis:** Zwraca szczegóły jednej stajni na podstawie jej ID.
 - **Dostępność:** Admin.
 - **Autoryzacja:** JWT (verifyToken, isAdmin)
 - **Odpowiedź:**
 ```json
{
    "stable": {
        "_id": "...",
        "fullName": "...",
        "location": "...",
        "capacity": "...",
        "description": "...",
        "stallArray": [...]
    }
}
```

## 🟡 POST /stables

 - **Opis:** Tworzy nową stajnię i generuje odpowiednią liczbę boksów - na podstawie `capacity`, o zadanym rozmiarze. Przypisuje boksom status dostępne - `available`. Stajnia zawiera tablicę referencji do utworzonych boksów - `stallArray`.
 - **Dostępność:** Admin.
 - **Autoryzacja:** JWT (verifyToken, isAdmin)
 - **Body (JSON):**
 ```json
{
    "name": "...",
    "location": "...",
    "capacity": "...",
    "description": "...",
    "stallSize": "..."
}
```

- **Odpowiedź:***
```json
{
  "message": "🍏 Stable was successfully created!",
  "stable": {
    ...
  }
}
```

## 🔵 PUT /stables/:stableID

 - **Opis:** Aktualizuje dane stajni na podstawie ID.
 - **Dostępność:** Admin.
 - **Autoryzacja:** JWT (verifyToken, isAdmin)
 - **Odpowiedź:**
 ```json
{
    "name": "...",
    "description": "..."
}
```
- **Odpowiedź:**
```JSON
{
  "message": "🍏 Stable updated successfully!",
  "stable": {
    ...
  }
}
```


## 🔴 DELETE /horses/:horseID

 - **Opis:** Usuwa stajnię oraz wszystkie boksy z nią powiązane. Jeśli którykolwiek boks był przypisany do konia update'uje się obiekt konia:

   - `stallId` ustawiany jest na `null`
   - `status` ustawiany jest na `"waiting for stall"` 
   
 - **Dostępność:** Admin.
 - **Autoryzacja:** JWT (verifyToken, isAdmin)
 - **Odpowiedź:** 
```json
{
  "message": "🍏 Stable deleted successfully!",
  "deletedStable": {
    ...
  }
}
```

