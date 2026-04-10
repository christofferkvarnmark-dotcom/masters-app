export default function Header({ activeTab, setActiveTab, isAdmin }) {
  const tabs = [
    { id: "standings", label: "Bet Standings" },
    { id: "leaderboard", label: "Leaderboard" },
    { id: "timeline", label: "Timeline" },
    ...(isAdmin
      ? [
          { id: "admin", label: "Admin Panel" },
          { id: "participants", label: "Manage Participants" },
        ]
      : []),
  ];

  return (
    <header className="bg-masters-green border-b-4 border-masters-gold shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="font-serif text-4xl md:text-5xl font-black text-masters-gold tracking-wide">
            The Masters
          </h1>
          <p className="font-serif text-masters-cream text-lg mt-1 italic">
            Augusta National Golf Club &middot; 2026
          </p>
        </div>
        <nav className="flex justify-center items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-t-lg font-semibold text-sm transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-masters-darker text-masters-gold"
                  : "bg-masters-dark/50 text-masters-cream/70 hover:bg-masters-dark hover:text-masters-cream"
              }`}
            >
              {tab.label}
            </button>
          ))}
          {!isAdmin && (
            <button
              onClick={() => setActiveTab("admin")}
              className="ml-2 px-3 py-2 rounded-t-lg text-masters-cream/40 hover:text-masters-gold transition cursor-pointer text-sm"
              title="Admin login"
            >
              &#128274;
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
