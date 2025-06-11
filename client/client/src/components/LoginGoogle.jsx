import React from "react";
import { useGoogleLogin } from "@react-oauth/google";

const LoginGoogle = () => {
  const login = useGoogleLogin({
    onSuccess: tokenResponse => {
      console.log("Zalogowano! Access Token:", tokenResponse.access_token);
      
    },
	  flow: "implicit", 
  ux_mode: "redirect" 
    
  });

  return (
    <button onClick={() => login()}>
      Zaloguj się przez Google
    </button>
  );
};

export default LoginGoogle;
