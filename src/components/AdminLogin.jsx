import { useState } from "react";

const ADMIN_PASSWORD = "masters2026";

export default function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("adminUnlocked", "true");
      onSuccess();
    } else {
      setError(true);
      setPassword("");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16 text-center">
      <div className="bg-masters-dark/50 rounded-xl p-8 border border-masters-green/30">
        <h2 className="font-serif text-2xl text-masters-gold mb-2">Admin Access</h2>
        <p className="text-masters-cream/50 text-sm mb-6">
          Enter the admin password to continue.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            placeholder="Password"
            autoFocus
            className="w-full px-4 py-2 bg-masters-darker border border-masters-green/40 rounded-lg text-masters-cream placeholder-masters-cream/30 focus:outline-none focus:border-masters-gold/60 text-center"
          />
          {error && (
            <p className="text-red-400 text-sm">Incorrect password.</p>
          )}
          <button
            type="submit"
            className="w-full px-4 py-2 bg-masters-green text-masters-cream font-semibold rounded-lg hover:bg-masters-gold hover:text-masters-darker transition cursor-pointer"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}
