// src/pages/AuthCallbackPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../config/supabase";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const code = searchParams.get("code");
        const token_hash = searchParams.get("token_hash");
        const type = searchParams.get("type");

        if (code) {
          // PKCE: échange code -> session
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else if (token_hash && type) {
          // Magic link / signup confirmation / recovery...
          const { error: confirmError } = await supabase.auth.verifyOtp({ token_hash, type });
          if (confirmError) throw confirmError;
        } else {
          // Rien à traiter
          navigate("/login", { replace: true });
          return;
        }

        // Vérifier la session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session?.user) {
          navigate("/login", { replace: true });
          return;
        }

        // Rediriger vers la suite (tes routes décideront dashboard vs complete-profile)
        navigate("/complete-profile", { replace: true });
      } catch (err) {
        console.error("Erreur dans AuthCallbackPage:", err);
        setError(err?.message || "Erreur lors de la validation");
        navigate("/login", { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h3>Easy Sécurité</h3>
      <p>Validation en cours...</p>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </div>
  );
}