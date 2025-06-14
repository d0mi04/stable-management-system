# 🐴 HORSE ROUTES - (`/horse`)

## 📣 Ogólne wskazówki:

 ✨ Wszystkie endpointy (poza rejestracją, logowaniem i GET /horses) wymagają tokenu JWT.

 ✨ Token JWT powinien być wysłany w nagłówku:
 ```makefile
 Authorization: Bearer JWT_TOKEN
```

✨ Można sprawdzać odpowiedzi z serwera i wyświetlać komunikaty (np. `message`) użytkownikowi.

✨ Przy błędach `401`, `403` można przekierować użytkownika do logowania lub wyświetlić info o braku uprawnień.

✨ Stosowanie `try/catch` oraz obsługi `.catch()` w zapytaniach axios lub fetch.

## 🟢 GET /horses

 - **Opis:** Pobiera listę wszystkich koni, filtruje wyniki.
 - **Dostępność:** Publiczna.
 - **Odpowiedź:**
 ```json
{
    "horses": [
        {
            "_id": "...",
            "name": "...",
            "birthDate": "...",
            "breed": "...",
            "notes": "...",
            "ownerEmail": "..."
        }
    ]
}
```

✅ **Wskazówka**: Możliwość wykorzystania do wyciągnięcia listy koni dostępnych dla wszystkich użytkowników.


## 🟢 GET /horses/waiting

 - **Opis:** Lista koni oczekujących na przypisanie do boksu.
 - **Dostępność:** Wymaga tokenu JWT i roli `admin`.
 - **Szczegóły:** konie są filtrowane po wartości pola `status: waiting for stall`.


✅ **Wskazówka**: Możliwość użycia tego endpointu w panelu administratora np. przy zarządzaniu przydziałem boksów.


## 🟢 GET /horses/:horseID

 - **Opis:** Pobiera szczegóły konkretnego konia.
 - **Dostępność:** Wymaga tokenu JWT.
 - **Szczegóły:** 

   - `admin` - ma możliwość wyświetlenia szczegółów każdego konia w stajni.
   - `user` może wyświetlić szczegóły tylko tych koni, których jest właścicielem - porównanie `userId` wyciągnięte z tokena z wartością pola `horse.owner`

✅ **Wskazówka**: Możliwość użycia tego endpointu w komponencie `HorseDetails`. Trzeba pamiętać o dodaniu tokenu w nagłówku żądania.

## 🟡 POST /horses

 - **Opis:** Dodaje nowego konia.
 - **Dostępność:** Wymaga tokenu JWT

 - **Body (JSON):**
 ```json
{
    "name": "...",
    "birthDate": "...",
    "breed": "...",
    "notes": "..."
}
```

 - **Szczegóły:** 

   - niektóre pola tworzą się automatycznie: `owner`, `ownerEmail`, `stallId`, `status`. Po utworzeniu konia otrzymuje defaultowy status `status: 'waiting for stall'` - dzięki temu może być widoczny dla admina na liście koni oczekujących na boks.

 - **Odpowiedź:**
 ```json
{
    "message": "🍏 Horse was successfully created!",
    "horse": {
        "name": "...",
        "birthDate": "...",
        "breed": "...",
        "notes": "...",
        "owner": "zaciągnięte z tokenu",
        "ownerEmail": "zaciągnięte z tokenu",
        "stallId": null,
        "status": "waiting for stall"
    }
}
```

✅ **Wskazówka**: Właściciel konia przypisuje się automatycznie na podstawie tokenu.

## 🔵 PUT /horses/:horseID

 - **Opis:** Aktualizuje dane konia.
 - **Dostępność:** Wymaga tokenu JWT

 - **Body (JSON):** zawiera pola do aktualizacji, np.
 ```json
{
  "notes": "Nowa notatka"
}

```

 - **Szczegóły:** 

   - endpoint blokuje nieautoryzowane użycie tego endpointu. Możliwość edycji konia jest wtedy, gdy `userId` wyciągnięte z tokena jest równe wartości pola `horse.owner`. `admin` może edytować dowolnego konia. 

✅ *Wskazówka*: Możliwość zablokowania niektórych pól na froncie (np. `birthDate`, `breed`, `owner`, `ownerEmail`, `stallId`) dla użytkownika `user` nie dopuszczzając do edycji tych pól.

## 🔵 PUT /horses/:horseID/assign-stall

 - **Opis:** Przypisuje boks do konia.
 - **Dostępność:** Wymaga tokenu JWT i roli `admin`.

 - **Body (JSON):** zawiera ID boksu, do którego chcemy przypisać konia
 ```json
{
  "stallId": "ID_BOKSU"
}

```
 - **Szczegóły:** 

   - uwstawia `stallId` i zmienia status boksu `status: 'occupied'`
   - endpoint aktualizuje oba dokumenty - konia i boksu. Po skończonej operacji koń otrzyma status `status: 'stall granted'` oraz przypisane mu zostanie ID boksu w polu `stallID`, boks natomiast otrzyma status `status: 'occupied'` i zostanie do niego przypisane ID konia w polu `horseID'`. 

✅ **Wskazówka**: nie ma wskazówki xd

## 🔵 PUT /horses/:horseID/unassign-stall

 - **Opis:** Wypisuje konia z boksu. 
 - **Dostępność:** Wymaga tokenu JWT i roli `admin`.
- **Szczegóły:** 

   - czyści `horseId: null` i zmienia status boksu na `status: available`. Aktualizuje też dane po stronie konia: status konia zmienia się na `status: 'waiting for stall'` a pole stallID - `stallId: null`.
 - **❗ nie ma body!**

## 🔴 DELETE /horses/:horseID

 - **Opis:** Usuwa konia z bazy. 
 - **Dostępność:** Wymaga tokenu JWT.
 - **Szczegóły:** 

   - endpoint blokuje nieautoryzowane użycie tego endpointu. Możliwość usunięcia konia jest wtedy, gdy `userId` wyciągnięte z tokena jest równe wartości pola `horse.owner`. `admin` może usunąć dowolnego konia.
   - sprawdza, czy do konia był przypisany boks. W momencie usuwania konia - zwalnia się jego boks. Status boksu zmienia się na `status: available` i usuwana jest wartość `horseId: null`.
