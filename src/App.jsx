import { useEffect, useState, useCallback } from "react";
import Chart from "./Chart";
import "./App.css";

const STORAGE_KEY = "trackers_pro_v1";

export default function App() {
  const [trackers, setTrackers] = useState([]);
  const [history, setHistory] = useState([]);
  const [dark, setDark] = useState(false);

  // ===== LOAD =====
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setTrackers(data.trackers || []);
        setDark(data.dark || false);
      } catch {
        console.error("Ошибка загрузки localStorage");
      }
    }
  }, []);

  // ===== SAVE =====
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ trackers, dark })
    );
  }, [trackers, dark]);

  // ===== HISTORY (UNDO) =====
  const pushHistory = useCallback(() => {
    setHistory(h => [...h.slice(-30), trackers]);
  }, [trackers]);

  const undo = () => {
    if (!history.length) return;
    setTrackers(history.at(-1));
    setHistory(h => h.slice(0, -1));
  };

  // ===== CRUD =====
  const addTracker = () => {
    pushHistory();
    setTrackers(t => [
      ...t,
      {
        id: Date.now(),
        title: "Новый трекер",
        category: "Общее",
        count: 0,
        log: [0],
      },
    ]);
  };

  const updateTracker = (id, changes) => {
    pushHistory();
    setTrackers(t =>
      t.map(tr => {
        if (tr.id !== id) return tr;

        const next = { ...tr, ...changes };

        if (changes.count !== undefined) {
          next.log = [...tr.log, changes.count];
        }

        return next;
      })
    );
  };

  const removeTracker = (id) => {
    pushHistory();
    setTrackers(t => t.filter(tr => tr.id !== id));
  };

  const resetAll = () => {
    if (!confirm("Удалить все трекеры?")) return;
    setTrackers([]);
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // ===== EXPORT / IMPORT =====
  const exportJSON = () => {
    const blob = new Blob(
      [JSON.stringify(trackers, null, 2)],
      { type: "application/json" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "trackers.json";
    a.click();
  };

  const importJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    file.text().then(text => {
      try {
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          pushHistory();
          setTrackers(data);
        }
      } catch {
        alert("Неверный JSON файл");
      }
    });
  };

  // ===== UI =====
  return (
    <div className={`app ${dark ? "dark" : ""}`}>
      <header>
        <h1>GTracker</h1>
        <div className="actions">
          <button onClick={addTracker}>＋</button>
          <button onClick={undo}>↩</button>
          <button onClick={() => setDark(d => !d)}>
            {dark ? "☀" : "🌙"}
          </button>
        </div>
      </header>

      <main>
        {trackers.map(tr => (
          <div className="tracker" key={tr.id}>
            <input
              value={tr.title}
              placeholder="Название"
              onChange={e =>
                updateTracker(tr.id, { title: e.target.value })
              }
            />

            <input
              className="category"
              value={tr.category}
              placeholder="Категория"
              onChange={e =>
                updateTracker(tr.id, { category: e.target.value })
              }
            />

            <div className="counter">
              <button
                onClick={() =>
                  updateTracker(tr.id, { count: tr.count - 1 })
                }
              >
                −
              </button>

              <span>{tr.count}</span>

              <button
                onClick={() =>
                  updateTracker(tr.id, { count: tr.count + 1 })
                }
              >
                ＋
              </button>
            </div>

            <Chart data={tr.log} />

            <button
              className="delete"
              onClick={() => removeTracker(tr.id)}
            >
              удалить
            </button>
          </div>
        ))}
      </main>

      <footer>
        <button onClick={exportJSON}>Экспорт</button>

        <label className="import">
          Импорт
          <input
            type="file"
            accept="application/json"
            hidden
            onChange={importJSON}
          />
        </label>

        <button onClick={resetAll}>Очистить</button>
      </footer>
    </div>
  );
}
