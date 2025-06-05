import React, { createContext, useContext } from "react";

// tworzenie kontekstu:
const StableContext = createContext();

// provider 
export const StableProvider = ({ children }) => {
    const values = {}; // tu można dodac później jakieś dane

    return (
        <StableContext.Provider value={values}>
            {children}
        </StableContext.Provider>
    );
};

// opcjonalny hook - może wykorzystam to później:
export const useStable = () => useContext(StableContext);