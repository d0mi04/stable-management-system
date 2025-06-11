import React, { useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode";

const TokenStatus = () => {
    const [tokenValid, setTokenValid] = useState(false);
    const [decoded, setDecoded] = useState(null);

    useEffect (() => {
        const token = localStorage.getItem("token");

        if(!token) {
            setTokenValid(false);
            setDecoded(null);
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            setDecoded(decodedToken);

            // sprawdzenie wygaśnięcia tokenu
            const currentTime = Date.now() / 1000;
            if(decodedToken.exp && decodedToken.exp < currentTime) {
                console.warn("Token expired");
                setTokenValid(false);
            } else {
                setTokenValid(true);
            }
        } catch (error) {
            console.error("Invalid token", error);
            setTokenValid(false);
            setDecoded(null);
        }
    }, []);

    return (
       <div style={{ padding: '1rem', border: '1px solid #ccc', margin: '1rem' }}>
      <h3>Token Test Component</h3>
      <p>Status: <strong>{tokenValid ? "✅ Token OK" : "❌ Brak lub nieprawidłowy token"}</strong></p>
      { decoded && (
        <div>
          <h4>Dane z tokena:</h4>
          <pre>{JSON.stringify(decoded, null, 2)}</pre>
        </div>
      )}
    </div> 
    );
};

export default TokenStatus;