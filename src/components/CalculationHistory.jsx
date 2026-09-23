import { useEffect, useMemo, useState } from "react";

import {
  getCalculations,
  clearCalculationHistory,
} from "../services/calculationService";

// Convert camelCase keys into readable labels
function formatLabel(text) {
  return text
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}

// Convert nested objects into readable text
function formatObject(obj) {
  if (!obj || typeof obj !== "object") {
    return String(obj ?? "");
  }

  return Object.entries(obj)
    .map(([key, value]) => {
      if (value === null || value === undefined) return null;

      if (typeof value === "object" && !Array.isArray(value)) {
        return `${formatLabel(key)}: ${formatObject(value)}`;
      }

      if (Array.isArray(value)) {
        return `${formatLabel(key)}: ${value.join(", ")}`;
      }

      return `${formatLabel(key)}: ${value}`;
    })
    .filter(Boolean)
    .join(" | ");
}

// Convert MongoDB record into history card format
function formatCalculation(calculation) {
  return {
    id: calculation._id,
    type:
      calculation.calculationType ||
      calculation.type ||
      "Calculation",

    details:
      typeof calculation.inputs === "object"
        ? formatObject(calculation.inputs)
        : calculation.details || "No details available",

    result:
      typeof calculation.result === "object"
        ? formatObject(calculation.result)
        : String(calculation.result ?? "No result available"),

    date: calculation.createdAt
      ? new Date(calculation.createdAt).toLocaleString("en-IN")
      : calculation.date || "Date unavailable",
  };
}

function CalculationHistory() {
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [calculations, setCalculations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const [error, setError] = useState("");
  const [clearError, setClearError] = useState("");

  // Fetch logged-in user's history from MongoDB
  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        setError("");

        const data = await getCalculations();

        const records = Array.isArray(data)
          ? data
          : data.calculations || data.data || [];

        setCalculations(records.map(formatCalculation));
      } catch (err) {
        console.error("Failed to load calculation history:", err);
        setError(err.message || "Unable to load calculation history.");
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  // Clear all history
  async function handleClearHistory() {
    const confirmed = window.confirm(
      "Are you sure you want to delete all your calculation history? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setClearing(true);
      setClearError("");

      await clearCalculationHistory();

      // Update UI after successful deletion
      setCalculations([]);
      setSearchText("");
      setFilterType("All");
    } catch (err) {
      console.error("Failed to clear history:", err);

      setClearError(
        err.message || "Unable to clear calculation history."
      );
    } finally {
      setClearing(false);
    }
  }

  const calculationTypes = [
    "All",
    ...new Set(calculations.map((calculation) => calculation.type)),
  ];

  const filteredHistory = useMemo(() => {
    return calculations.filter((calculation) => {
      const matchesType =
        filterType === "All" || calculation.type === filterType;

      const searchValue = searchText.toLowerCase();

      const matchesSearch =
        calculation.type?.toLowerCase().includes(searchValue) ||
        calculation.details?.toLowerCase().includes(searchValue) ||
        calculation.result?.toLowerCase().includes(searchValue);

      return matchesType && matchesSearch;
    });
  }, [calculations, searchText, filterType]);

  return (
    <div className="history-container">
      {/* Header */}
      <div className="history-header">
        <div>
          <span className="history-badge">ACTIVITY</span>

          <h2>Calculation History</h2>

          <p>
            Review your previous financial calculations in one place.
          </p>
        </div>

        {!loading && !error && calculations.length > 0 && (
          <div className="history-count">
            <strong>{calculations.length}</strong>
            <span>Total Calculations</span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="history-empty">
          <h3>Loading your history...</h3>
          <p>Please wait while we fetch your saved calculations.</p>
        </div>
      ) : error ? (
        /* Error State */
        <div className="history-no-results">
          <h3>Could not load history</h3>
          <p>{error}</p>
        </div>
      ) : calculations.length === 0 ? (
        /* Empty State */
        <div className="history-empty">
          <div className="history-empty-icon">⌁</div>

          <h3>No calculations yet</h3>

          <p>
            Your saved calculations will appear here once you start
            using FinCalc.
          </p>
        </div>
      ) : (
        <>
          {/* Search + Filter + Clear All */}
          <div className="history-toolbar">
            <div className="history-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search calculations..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              {calculationTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "All" ? "All Calculations" : type}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="history-clear-btn"
              onClick={handleClearHistory}
              disabled={clearing}
            >
              {clearing ? "Clearing..." : "Clear All"}
            </button>
          </div>

          {/* Clear Error */}
          {clearError && (
            <div className="history-no-results">
              <p>{clearError}</p>
            </div>
          )}

          {/* Results */}
          {filteredHistory.length === 0 ? (
            <div className="history-no-results">
              <h3>No matching calculations</h3>
              <p>Try a different search term or filter.</p>
            </div>
          ) : (
            <div className="history-list">
              {filteredHistory.map((calculation, index) => (
                <div
                  className="history-card"
                  key={
                    calculation.id ||
                    `${calculation.date}-${index}`
                  }
                >
                  <div className="history-card-top">
                    <div className="history-type">
                      {calculation.type}
                    </div>

                    <span className="history-number">
                      #{filteredHistory.length - index}
                    </span>
                  </div>

                  <div className="history-details">
                    <span>Calculation</span>
                    <strong>{calculation.details}</strong>
                  </div>

                  <div className="history-result">
                    <span>Result</span>
                    <strong>{calculation.result}</strong>
                  </div>

                  <div className="history-card-footer">
                    <span>🕒 {calculation.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CalculationHistory;