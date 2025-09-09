import React, { useState } from "react";

/* ========= DANE KREATORA ========= */
const races = {
  Ludzie: {
    description: "test ludzie",
    racialPassive: "test 123",
    subraces: {
      "Ludzie Słońca": { description: "test ludzi slonca", passive: "test ludzi slonca" },
      "Ludzie Księżyca": { description: "test ludzie księzyca", passive: "test ludzie księzyca" },
      "Ludzie Mrocznego Słońca": { description: "test ludzi mrocznego slonca", passive: "test ludzi mrocznego slonca" },
      "Ludzie Mrocznego Księżyca": { description: "test ludzie mrocznego ksiezyca", passive: "test ludzie mrocznego ksiezyca" },
    },
  },
  Krasnoludy: {
    description: "test krasnoludy",
    racialPassive: "test 456",
    subraces: {
      "Krasnoludy Diamentu": { description: "...", passive: "..." },
      "Krasnoludy Rubinu":   { description: "...", passive: "..." },
      "Krasnoludy Szafira":  { description: "...", passive: "..." },
      "Krasnoludy Szmaragdu":{ description: "...", passive: "..." },
    },
  },
  Elfy: {
    description: "test elfy",
    racialPassive: "test 789",
    subraces: {
      "Pierwotne Elfy Ognia":     { description: "test Elfy Ognia",     passive: "test Elfy Ognia" },
      "Pierwotne Elfy Wody":      { description: "test Elfy Wody",      passive: "test Elfy Wody" },
      "Pierwotne Elfy Ziemii":    { description: "test Elfy Ziemii",    passive: "test Elfy Ziemii" },
      "Pierwotne Elfy Powietrza": { description: "test Elfy Powietrza", passive: "test Elfy Powietrza" },
    },
  },
  Faeykai: {
    description: "test dziecko Asi",
    racialPassive: "test 000",
    subraces: {
      "Faeykai Życia - lato":   { description: "test dziecko Asi 1", passive: "test dziecko Asi 12" },
      "Faeykai Życia - wiosna": { description: "test dziecko Asi 2", passive: "test dziecko Asi 23" },
      "Faeykai Śmierci - jesień":{ description: "test dziecko Asi 3", passive: "test dziecko Asi 34" },
      "Faeykai Śmierci - zima": { description: "test dziecko Asi 4", passive: "test dziecko Asi 45" },
    },
  },
};

const passives = {
  Wojownik:
    "Raz na odpoczynek wojownik może zaatakować z maksymalną skutecznością (czyli wchodzą pełne obrażenia, nie liczy się pancerz ani uniki).",
  Łucznik:
    "Raz na odpoczynek łucznik może oddać celny strzał który obniża przeciwnikowi o -5 rzuty na unik (czas trwania 3 tury)",
  Strzelec:
    "Raz na odpoczynek strzelec może oddać druzgocący strzał który obniża wartość pancerza przeciwnika o 50% na 3 tury.",
  Mag:
    "Raz na odpoczynek mag, po rzuceniu zaklęcia może dodać żywioł zaklęcia i 50% zadanych obrażeń jako tarczę dla siebie. Każdy kto zaatakuje maga z tarczą otrzyma obrażenia równe wysokości tarczy.",
  Dyplomata:
    "Raz na odpoczynek dyplomata może wykonać rzut na charyzmę aby zmusić jednego wroga do zaatakowania konkretnego celu. Jeśli atak się odbędzie wybrany wróg nie może już zaatakować w swojej turze.",
};

/* Statystyki – wg Twoich nazw */
const STATS = [
  { key: "strength",   label: "Siła" },
  { key: "dexterity",  label: "Zręczność" },
  { key: "perception", label: "Spostrzegawczość" },
  { key: "charisma",   label: "Charyzma" },
  { key: "magic",      label: "magia" },
];

/* ========= POMOCNICZE (zakładka 2) ========= */
const d = (sides) => Math.floor(Math.random() * sides) + 1; // 1..sides
function statMod(value) {
  if (value <= 1) return 0;
  if (value <= 4) return 1;
  if (value <= 7) return 2;
  if (value <= 10) return 3;
  return 4;
}
const weaponData = {
  sword: { name: "Miecz krótki", stat: "STR", dmgDie: 6 },
  bow:   { name: "Łuk",          stat: "PER", dmgDie: 6 },
  staff: { name: "Kij magiczny", stat: "MAG", dmgDie: 4 },
};

/* ========= KOMPONENT Z ZAKŁADKAMI ========= */
export default function CharacterCreator() {
  const [tab, setTab] = useState("creator"); // 'creator' | 'sim'

  /* --- stan kreatora (zakładka 1) --- */
  const [character, setCharacter] = useState({
    name: "",
    race: "",
    subrace: "",
    passive: "",
    life: 0,
    essence: 0,
    armor: 0,
    strength: null,
    dexterity: null,
    perception: null,
    charisma: null,
    magic: null,
  });
  const [rolls, setRolls] = useState([]); // 5 kostek
  const [activeStat, setActiveStat] = useState(null);
  const [arts, setArts] = useState([]);

  /* --- stan symulatora (zakładka 2) --- */
  const [rolledValues, setRolledValues] = useState([]);
  const [simStats, setSimStats] = useState({ STR: null, DEX: null, PER: null, MAG: null, CHA: null });
  const [locked, setLocked] = useState(false);
  const [log, setLog] = useState([]);
  const [weapon, setWeapon] = useState("sword");
  const [defense, setDefense] = useState(12);
  const [enemyArmor, setEnemyArmor] = useState(2);

  /* ====== KREATOR – handlery ====== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "race") {
      setCharacter((prev) => ({ ...prev, race: value, subrace: "" }));
    } else {
      setCharacter((prev) => ({ ...prev, [name]: value }));
    }
  };

  const rollDice = () => {
    const mods = [2, 1, 0, -1, -2];
    const newRolls = mods.map((m, i) => ({
      id: Date.now() + i,
      value: Math.floor(Math.random() * 6) + 1 + m,
    }));
    const cleared = { strength: null, dexterity: null, perception: null, charisma: null, magic: null };
    setCharacter((prev) => ({ ...prev, ...cleared }));
    setRolls(newRolls);
    setActiveStat(null);
  };

  const handleStatClick = (key) => {
    if (character[key] !== null) {
      setRolls((prev) => [...prev, { id: Date.now(), value: character[key] }]);
      setCharacter((prev) => ({ ...prev, [key]: null }));
      setActiveStat(key);
    } else {
      setActiveStat(key);
    }
  };

  const handleRollClick = (rollId) => {
    if (!activeStat) return;
    setRolls((prev) => {
      const idx = prev.findIndex((r) => r.id === rollId);
      if (idx === -1) return prev;
      const chosen = prev[idx];
      setCharacter((c) => ({ ...c, [activeStat]: chosen.value }));
      setActiveStat(null);
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
  };

  const handleAddArt = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const toAdd = files.map((f, i) => ({
      id: Date.now() + i,
      url: URL.createObjectURL(f),
      name: f.name,
    }));
    setArts((prev) => [...prev, ...toAdd]);
    e.target.value = "";
  };
  const removeArt = (id) => setArts((prev) => prev.filter((a) => a.id !== id));

  /* ====== SYMULATOR – funkcje ====== */
  function addLog(line) {
    const stamp = new Date().toLocaleTimeString();
    setLog((prev) => [`[${stamp}] ${line}`, ...prev]);
  }
  function rollFive() {
    const mods = [2, 1, 0, -1, -2];
    const rolls = mods.map((m) => d(6) + m);
    setRolledValues(rolls);
    setSimStats({ STR: null, DEX: null, PER: null, MAG: null, CHA: null });
    setLocked(false);
    addLog(
      `Wylosowane wartości: ${rolls
        .map((v, i) => `${v}(${mods[i] >= 0 ? "+" : ""}${mods[i]})`)
        .join(", ")}`
    );
  }
  function lockStats(values) {
    if (Object.values(values).some((v) => v === null || v === "")) {
      addLog("❌ Każda statystyka musi otrzymać wartość.");
      return;
    }
    setSimStats(values);
    setLocked(true);
    addLog(
      `✔️ Statystyki zatwierdzone: ${Object.entries(values)
        .map(([k, v]) => `${k} ${v} (mod ${statMod(Number(v))})`)
        .join(", ")}`
    );
  }
  function doAttack() {
    if (!locked) {
      addLog("❌ Najpierw zatwierdź statystyki.");
      return;
    }
    const w = weaponData[weapon];
    const used =
      w.stat === "STR" ? Number(simStats.STR) :
      w.stat === "PER" ? Number(simStats.PER) :
      Number(simStats.MAG);

    const toHitRoll = d(20);
    const toHitTotal = toHitRoll + used;
    const success = toHitTotal >= Number(defense);
    addLog(
      `Atak: ${w.name} (używa ${w.stat}). k20=${toHitRoll} + ${used} = ${toHitTotal} vs Obrona ${defense} → ${success ? "✅ TRAFIENIE" : "❌ PUDŁO"}`
    );
    if (!success) return;

    const rawDie = d(w.dmgDie);
    const mod = statMod(used);
    const raw = rawDie + mod;
    const dmg = Math.max(0, raw - Number(enemyArmor));
    addLog(`Obrażenia: k${w.dmgDie}=${rawDie} + mod=${mod} = ${raw} − pancerz ${enemyArmor} → ${dmg}.`);
  }

  /* ====== UI wspólne ====== */
  const Tabs = () => (
    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      {["creator", "sim"].map((id) => (
        <button
          key={id}
          onClick={() => setTab(id)}
          style={{
            padding: "8px 14px",
            border: "1px solid #ccc",
            borderBottom: tab === id ? "2px solid #333" : "1px solid #ccc",
            background: tab === id ? "#f7f7f7" : "#fff",
            fontWeight: tab === id ? 700 : 400,
            cursor: "pointer",
          }}
        >
          {id === "creator" ? "Kreator postaci" : "Symulator walki"}
        </button>
      ))}
    </div>
  );

  /* ====== RENDER ====== */
  return (
    <div style={{ padding: 16 }}>
      <Tabs />

      {tab === "creator" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.2fr 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* LEWA kolumna */}
          <div>
            <h2>Imię</h2>
            <input type="text" name="name" value={character.name} onChange={handleChange} />

            <h2 style={{ marginTop: 16 }}>Rasa</h2>
            <select name="race" value={character.race} onChange={handleChange}>
              <option value="">Wybierz rasę</option>
              {Object.keys(races).map((race) => (
                <option key={race} value={race}>
                  {race}
                </option>
              ))}
            </select>

            {character.race && (
              <>
                <p style={{ marginTop: 8 }}>{races[character.race].description}</p>
                <p><strong>Pasywka Rasowa:</strong> {races[character.race].racialPassive}</p>

                <h3 style={{ marginTop: 12 }}>Podrasa</h3>
                <select name="subrace" value={character.subrace} onChange={handleChange}>
                  <option value="">Wybierz podrase</option>
                  {Object.keys(races[character.race].subraces).map((sr) => (
                    <option key={sr} value={sr}>{sr}</option>
                  ))}
                </select>

                {character.subrace && (
                  <>
                    <p style={{ marginTop: 8 }}>
                      {races[character.race].subraces[character.subrace].description}
                    </p>
                    <p>
                      <strong>Pasywka Podrasy:</strong>{" "}
                      {races[character.race].subraces[character.subrace].passive}
                    </p>
                  </>
                )}
              </>
            )}

            <h2 style={{ marginTop: 16 }}>Pasywki klasowe</h2>
            <select name="passive" value={character.passive} onChange={handleChange}>
              <option value="">Wybierz pasywkę</option>
              {Object.keys(passives).map((pass) => (
                <option key={pass} value={pass}>{pass}</option>
              ))}
            </select>
            {character.passive && <p style={{ marginTop: 8 }}>{passives[character.passive]}</p>}
          </div>

          {/* ŚRODKOWA kolumna */}
          <div>
            <h2>Statystyki stałe</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(160px, 1fr))",
                gap: 8,
              }}
            >
              <label>
                Życie
                <input type="number" name="life" value={character.life} onChange={handleChange} />
              </label>
              <label>
                Esencja
                <input type="number" name="essence" value={character.essence} onChange={handleChange} />
              </label>
              <label>
                Pancerz
                <input type="number" name="armor" value={character.armor} onChange={handleChange} />
              </label>
            </div>

            <div style={{ marginTop: 10 }}>
              <button onClick={rollDice}>Rzut kośćmi</button>
            </div>

            <div style={{ marginTop: 16 }}>
              <h3>Kości</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {rolls.length === 0 ? (
                  <span style={{ opacity: 0.7 }}>Brak kości w puli</span>
                ) : (
                  rolls.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => handleRollClick(r.id)}
                      title={activeStat ? `Przypisz do: ${activeStat}` : "Najpierw kliknij statystykę"}
                      style={{
                        width: 42, height: 42, borderRadius: 8,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: activeStat ? "#4fa3ff" : "#6aa9ff",
                        color: "#fff", fontWeight: 700,
                        cursor: activeStat ? "pointer" : "not-allowed",
                        userSelect: "none",
                      }}
                    >
                      {r.value}
                    </div>
                  ))
                )}
              </div>

              <h3>Przypisywanie do statystyk</h3>
              {STATS.map((s) => (
                <div
                  key={s.key}
                  onClick={() => handleStatClick(s.key)}
                  style={{
                    marginBottom: 10, padding: "4px 8px", borderRadius: 6, cursor: "pointer",
                    background:
                      character[s.key] !== null
                        ? "#d4edda"
                        : activeStat === s.key
                        ? "#fceabb"
                        : "transparent",
                  }}
                >
                  <strong style={{ width: 200, display: "inline-block" }}>{s.label}:</strong>
                  <span style={{ fontWeight: 700 }}>
                    {character[s.key] !== null
                      ? character[s.key]
                      : activeStat === s.key
                      ? "Wybierz kość"
                      : "-"}
                  </span>
                </div>
              ))}

              <h2 style={{ marginTop: 16 }}>Ekwipunek</h2>
              <p style={{ opacity: 0.7 }}>(dodamy w następnej iteracji)</p>
            </div>
          </div>

          {/* PRAWA kolumna – ART */}
          <div>
            <h2>ART</h2>
            <input type="file" accept="image/*" multiple onChange={handleAddArt} />
            <div
              style={{
                marginTop: 12,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: 8,
              }}
            >
              {arts.map((a) => (
                <div key={a.id} style={{ position: "relative" }}>
                  <img
                    src={a.url}
                    alt={a.name}
                    style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8 }}
                  />
                  <button
                    onClick={() => removeArt(a.id)}
                    style={{
                      position: "absolute", top: 4, right: 4,
                      background: "rgba(0,0,0,0.6)", color: "#fff",
                      border: "none", borderRadius: 4, padding: "2px 6px",
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              {arts.length === 0 && <p style={{ opacity: 0.6 }}>Brak dodanych grafik</p>}
            </div>
          </div>
        </div>
      )}

      {tab === "sim" && (
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h1>⚔️ Symulator testu walki</h1>
          <p>Rozdaj 5 rzutów k6 z modyfikatorami (+2, +1, 0, −1, −2), wybierz broń, podaj Obronę i Pancerz celu i wykonaj atak.</p>

          <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginTop: 12 }}>
            <h2>1) Statystyki postaci</h2>
            <button onClick={rollFive}>🎲 Rzuć 5×k6</button>

            {rolledValues.length > 0 && (
              <>
                <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {rolledValues.map((v, i) => (
                    <span key={i} style={{ padding: "4px 8px", borderRadius: 999, border: "1px solid #bbb", background: "#eee", fontSize: 12 }}>
                      #{i + 1}: {v}
                    </span>
                  ))}
                </div>

                <div style={{ marginTop: 12, display: "grid", gap: 8, gridTemplateColumns: "repeat(5, 1fr)" }}>
                  {["STR", "DEX", "PER", "MAG", "CHA"].map((k) => (
                    <label key={k} style={{ display: "flex", flexDirection: "column", fontSize: 14 }}>
                      {k}
                      <input
                        type="number"
                        placeholder="wartość"
                        value={simStats[k] ?? ""}
                        onChange={(e) =>
                          setSimStats((prev) => ({ ...prev, [k]: e.target.value === "" ? null : Number(e.target.value) }))
                        }
                      />
                      <small style={{ opacity: 0.7 }}>
                        mod: {simStats[k] != null ? statMod(Number(simStats[k])) : "-"}
                      </small>
                    </label>
                  ))}
                </div>

                <div style={{ marginTop: 8 }}>
                  <button onClick={() => lockStats(simStats)}>✔️ Zatwierdź statystyki</button>
                </div>
              </>
            )}
          </div>

          <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginTop: 12 }}>
            <h2>2) Test ataku</h2>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(3, 1fr)" }}>
              <label>
                Broń
                <select value={weapon} onChange={(e) => setWeapon(e.target.value)}>
                  <option value="sword">Miecz krótki (Siła)</option>
                  <option value="bow">Łuk (Spostrzegawczość)</option>
                  <option value="staff">Kij magiczny (Magia)</option>
                </select>
              </label>
              <label>
                Obrona celu
                <input type="number" value={defense} onChange={(e) => setDefense(Number(e.target.value))} />
              </label>
              <label>
                Pancerz celu
                <input type="number" value={enemyArmor} onChange={(e) => setEnemyArmor(Number(e.target.value))} />
              </label>
            </div>

            <div style={{ marginTop: 8 }}>
              <button onClick={doAttack}>⚔️ Wykonaj atak</button>
            </div>

            <div style={{ background: "#111", color: "#eee", borderRadius: 6, padding: 10, marginTop: 12, maxHeight: 220, overflow: "auto", fontSize: 13 }}>
              {log.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
