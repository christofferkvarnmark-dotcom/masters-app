import { useState } from "react";
import { GOLFERS_2026 } from "../data/golfers";

export default function ParticipantManager({ participants, setParticipants, golferScores }) {
  const [name, setName] = useState("");
  const [selectedGolfers, setSelectedGolfers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [golferSearch, setGolferSearch] = useState("");

  const filteredGolfers = GOLFERS_2026.filter((g) =>
    g.toLowerCase().includes(golferSearch.toLowerCase())
  );

  const toggleGolfer = (golfer) => {
    setSelectedGolfers((prev) =>
      prev.includes(golfer)
        ? prev.filter((g) => g !== golfer)
        : [...prev, golfer]
    );
  };

  const saveParticipant = () => {
    if (!name.trim() || selectedGolfers.length === 0) return;
    if (editingId) {
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === editingId ? { ...p, name: name.trim(), golfers: selectedGolfers } : p
        )
      );
      setEditingId(null);
    } else {
      setParticipants((prev) => [
        ...prev,
        { id: Date.now().toString(), name: name.trim(), golfers: selectedGolfers },
      ]);
    }
    setName("");
    setSelectedGolfers([]);
    setGolferSearch("");
  };

  const editParticipant = (p) => {
    setName(p.name);
    setSelectedGolfers(p.golfers);
    setEditingId(p.id);
  };

  const deleteParticipant = (id) => {
    if (!window.confirm("Remove this participant?")) return;
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setName("");
      setSelectedGolfers([]);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setSelectedGolfers([]);
    setGolferSearch("");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="font-serif text-2xl text-masters-gold font-bold mb-6">
        Manage Participants
      </h2>

      {/* Add/Edit Form */}
      <div className="bg-masters-dark rounded-xl p-6 mb-8 shadow-xl">
        <h3 className="text-masters-cream font-semibold mb-4">
          {editingId ? "Edit Participant" : "Add Participant"}
        </h3>
        <input
          type="text"
          placeholder="Participant name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-lg bg-masters-darker border border-masters-green text-white placeholder-masters-cream/40 focus:outline-none focus:ring-2 focus:ring-masters-gold"
        />

        <p className="text-masters-cream/60 text-sm mb-2">
          Select golfers ({selectedGolfers.length} selected):
        </p>
        <input
          type="text"
          placeholder="Search golfers..."
          value={golferSearch}
          onChange={(e) => setGolferSearch(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded-lg bg-masters-darker border border-masters-green/50 text-white text-sm placeholder-masters-cream/30 focus:outline-none focus:ring-1 focus:ring-masters-gold"
        />
        <div className="max-h-48 overflow-y-auto mb-4 grid grid-cols-2 md:grid-cols-3 gap-1">
          {filteredGolfers.map((golfer) => (
            <button
              key={golfer}
              onClick={() => toggleGolfer(golfer)}
              className={`text-left px-3 py-1.5 rounded text-xs transition cursor-pointer ${
                selectedGolfers.includes(golfer)
                  ? "bg-masters-gold text-masters-darker font-bold"
                  : "bg-masters-green/30 text-masters-cream/70 hover:bg-masters-green/50"
              }`}
            >
              {golfer}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={saveParticipant}
            disabled={!name.trim() || selectedGolfers.length === 0}
            className="px-6 py-2.5 bg-masters-gold text-masters-darker font-bold rounded-lg hover:bg-masters-gold-dim transition disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          >
            {editingId ? "Update" : "Add Participant"}
          </button>
          {editingId && (
            <button
              onClick={cancelEdit}
              className="px-6 py-2.5 bg-masters-green text-white rounded-lg hover:bg-masters-dark transition cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Participants List */}
      {participants.length > 0 && (
        <div className="space-y-3">
          {participants.map((p) => (
            <div
              key={p.id}
              className="bg-masters-dark rounded-xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <h4 className="text-masters-gold font-bold text-lg">{p.name}</h4>
                <p className="text-masters-cream/60 text-xs mt-1">
                  {p.golfers.join(", ")}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => editParticipant(p)}
                  className="px-3 py-1.5 bg-masters-green text-white text-sm rounded-lg hover:bg-masters-gold hover:text-masters-darker transition cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteParticipant(p.id)}
                  className="px-3 py-1.5 bg-red-800 text-white text-sm rounded-lg hover:bg-red-600 transition cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
