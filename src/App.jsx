import { useState } from "react";
import Login from "./components/Login";
import Signup from "./components/Signup";
import EMICalculator from "./components/EMICalculator";
import SIPCalculator from "./components/SIPCalculator";
import SWPCalculator from "./components/SWPCalculator";
import LoanComparison from "./components/LoanComparison";
import LoanEligibility from "./components/LoanEligibility";
import CurrencyConverter from "./components/CurrencyConverter";
import CalculationHistory from "./components/CalculationHistory";
import "./App.css";

/* =========================
   ICONS
========================= */

function Icon({ type }) {
  const props = {
    width: 26,
    height: 26,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  const icons = {
    emi: (
      <>
        <rect x="5" y="2.5" width="14" height="19" rx="2.5" />
        <line x1="8" y1="6.5" x2="16" y2="6.5" />
        <circle cx="9" cy="11" r="1" />
        <circle cx="15" cy="11" r="1" />
        <circle cx="9" cy="16" r="1" />
        <circle cx="15" cy="16" r="1" />
        <line x1="11.5" y1="11" x2="13" y2="11" />
        <line x1="11.5" y1="16" x2="13" y2="16" />
      </>
    ),

    sip: (
      <>
        <path d="M4 17L9 12L13 15L20 7" />
        <path d="M15 7H20V12" />
        <path d="M4 20H20" />
      </>
    ),

    swp: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7V17" />
        <path d="M9.5 9.5C9.8 8.5 10.8 8 12 8C13.5 8 14.5 8.8 14.5 10" />
        <path d="M14.5 14.5C14.2 15.5 13.2 16 12 16C10.5 16 9.5 15.2 9.5 14" />
      </>
    ),

    comparison: (
      <>
        <path d="M7 5H20" />
        <path d="M17 2L20 5L17 8" />
        <path d="M17 19H4" />
        <path d="M7 16L4 19L7 22" />
        <path d="M4 9H14" />
        <path d="M4 12H11" />
      </>
    ),

    eligibility: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 7H16" />
        <path d="M8 11H12" />
        <path d="M8 15L10.5 17.5L16 12" />
      </>
    ),

    currency: (
      <>
        <path d="M7 7H20" />
        <path d="M17 4L20 7L17 10" />
        <path d="M17 17H4" />
        <path d="M7 14L4 17L7 20" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),

    history: (
      <>
        <path d="M4 12A8 8 0 1 0 6.5 6.5" />
        <path d="M4 5V12H11" />
        <path d="M12 8V12L15 14" />
      </>
    ),

    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15A1.7 1.7 0 0 0 19.7 17L18 18.7A1.7 1.7 0 0 0 16 18.4A1.7 1.7 0 0 0 14.5 20H9.5A1.7 1.7 0 0 0 8 18.4A1.7 1.7 0 0 0 6 18.7L4.3 17A1.7 1.7 0 0 0 4.6 15A1.7 1.7 0 0 0 3 13.5V10.5A1.7 1.7 0 0 0 4.6 9A1.7 1.7 0 0 0 4.3 7L6 5.3A1.7 1.7 0 0 0 8 5.6A1.7 1.7 0 0 0 9.5 4H14.5A1.7 1.7 0 0 0 16 5.6A1.7 1.7 0 0 0 18 5.3L19.7 7A1.7 1.7 0 0 0 19.4 9A1.7 1.7 0 0 0 21 10.5V13.5A1.7 1.7 0 0 0 19.4 15Z" />
      </>
    ),

    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.3" />
        <path d="M16 16L21 21" />
      </>
    ),
  };

  return <svg {...props}>{icons[type]}</svg>;
}

/* =========================
   CALCULATORS
========================= */

const calculators = [
  {
    id: "emi",
    title: "EMI Calculator",
    description:
      "Calculate your monthly EMI, total interest, total payment and view a detailed repayment breakdown for your loan.",
    icon: "emi",
    component: EMICalculator,
  },
  {
    id: "sip",
    title: "SIP Calculator",
    description:
      "Estimate your SIP returns, maturity amount, total investment and potential wealth growth over time.",
    icon: "sip",
    component: SIPCalculator,
  },
  {
    id: "swp",
    title: "SWP Calculator",
    description:
      "Plan your regular withdrawals, estimate the remaining investment value and understand how long your money may last.",
    icon: "swp",
    component: SWPCalculator,
  },
  {
    id: "comparison",
    title: "Compare Loans",
    description:
      "Compare different loan options based on interest rate, monthly EMI, total interest and overall repayment amount.",
    icon: "comparison",
    component: LoanComparison,
  },
  {
    id: "eligibility",
    title: "Loan Eligibility",
    description:
      "Estimate the loan amount you may be eligible for based on your income, existing obligations and repayment capacity.",
    icon: "eligibility",
    component: LoanEligibility,
  },
  {
    id: "currency",
    title: "Currency Converter",
    description:
      "Convert amounts between different currencies quickly and easily using the latest available exchange rates.",
    icon: "currency",
    component: CurrencyConverter,
  },
];

/* =========================
   CALCULATOR CARD
========================= */

function CalculatorCard({ calculator, onClick }) {
  return (
    <button
      className="calculator-menu-card"
      onClick={onClick}
    >
      <div className="calculator-card-top">
        <div className={`calculator-icon icon-${calculator.icon}`}>
          <Icon type={calculator.icon} />
        </div>

        <span className="calculator-title">
          {calculator.title}
        </span>
      </div>

      <span className="calculator-description">
        {calculator.description}
      </span>

      <span className="calculate-now">
        Calculate Now →
      </span>
    </button>
  );
}

/* =========================
   PAGE HEADING
========================= */

function PageHeading({ label, title, description }) {
  return (
    <div className="page-heading">
      <p>{label}</p>
      <h2>{title}</h2>
      <span>{description}</span>
    </div>
  );
}

/* =========================
   MAIN APP
========================= */

function App() {
  const [activePage, setActivePage] = useState("login");
  const [searchText, setSearchText] = useState("");

  const [theme, setTheme] = useState(
    () => localStorage.getItem("fincalc-theme") || "dark"
  );

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("calculationHistory");
    return saved ? JSON.parse(saved) : [];
  });

  /* =========================
     THEME
  ========================= */

  function changeTheme(newTheme) {
    setTheme(newTheme);
    localStorage.setItem("fincalc-theme", newTheme);
  }

  /* =========================
     HISTORY
  ========================= */

  function addToHistory(calculation) {
    setHistory((previous) => {
      const updated = [...previous, calculation];

      localStorage.setItem(
        "calculationHistory",
        JSON.stringify(updated)
      );

      return updated;
    });
  }

  function clearHistory() {
    localStorage.removeItem("calculationHistory");
    setHistory([]);
  }

  /* =========================
     NAVIGATION
  ========================= */

  function goHome() {
    setActivePage("home");
    setSearchText("");
  }

  function openCalculator(id) {
    setActivePage(id);
    setSearchText("");
  }

  /* =========================
     SEARCH
  ========================= */

  const filteredCalculators = calculators.filter((calculator) => {
    const search = searchText.toLowerCase().trim();

    if (!search) return true;

    return (
      calculator.title.toLowerCase().includes(search) ||
      calculator.description.toLowerCase().includes(search)
    );
  });

  /* =========================
     SELECTED CALCULATOR
  ========================= */

  const selected = calculators.find(
    (calculator) => calculator.id === activePage
  );

  const SelectedCalculator = selected?.component;

  return (
    <div className={`app theme-${theme}`}>

      {/* HEADER */}

      <header className="app-header">
        <button
          className="brand-area"
          onClick={goHome}
          aria-label="Go to FinCalc home"
        >
          <div>
            <h1>FinCalc</h1>
            <p>Plan smarter. Calculate better.</p>
          </div>
        </button>
      </header>

      {/* LOGIN */}

      {activePage === "login" && (
        <Login
          onLogin={() => setActivePage("home")}
          onSignup={() => setActivePage("signup")}
          onBack={goHome}
        />
      )}

      {/* SIGNUP */}

      {activePage === "signup" && (
        <Signup
          onSignup={() => setActivePage("login")}
          onBack={() => setActivePage("login")}
        />
      )}

      {/* HOME */}

      {activePage === "home" && (
        <main className="home-page">

          <section className="welcome-card">

            <img
              src="/src/assets/hero.png"
              alt=""
              className="welcome-background"
            />

            <div className="welcome-overlay"></div>

            <div className="welcome-text">

              <p className="welcome-label">
                YOUR FINANCE TOOLKIT
              </p>

              <h2>
                Make smarter financial decisions.
              </h2>

              <p>
                Calculate loans, investments and currencies with ease.
                Make informed financial decisions with quick, simple and reliable results.
              </p>

              <p className="welcome-cta">
                Explore Calculators →
              </p>

              <div className="welcome-stats">
                <div>
                  <strong>6+ Calculators</strong>
                </div>

                <div>
                  <strong>Instant Results</strong>
                </div>

                <div>
                  <strong>100% Secure</strong>
                </div>
              </div>

            </div>
          </section>

          {/* HOME SEARCH */}

          <div className="home-search-row">

            <div className="home-search">

              <Icon type="search" />

              <input
                type="text"
                placeholder="Search calculators..."
                value={searchText}
                onChange={(event) =>
                  setSearchText(event.target.value)
                }
              />

            </div>

            <button
              className="header-action-button"
              onClick={() => setActivePage("settings")}
              aria-label="Settings"
            >
              <Icon type="settings" />
            </button>

          </div>

          <section className="tools-section">

            <div className="section-heading">
              <h1>Financial Tools</h1>

              <p>
                {searchText.trim()
                  ? "Search results"
                  : "Choose a calculator to get started"}
              </p>
            </div>

            <div className="calculator-menu">

              {filteredCalculators.length > 0 ? (
                filteredCalculators.map((calculator) => (
                  <CalculatorCard
                    key={calculator.id}
                    calculator={calculator}
                    onClick={() =>
                      openCalculator(calculator.id)
                    }
                  />
                ))
              ) : (
                <div className="no-search-results">
                  <h3>No calculator found</h3>

                  <p>
                    Try searching for EMI, SIP, SWP,
                    loan or currency.
                  </p>
                </div>
              )}

              {!searchText.trim() && (
                <CalculatorCard
                  calculator={{
                    title: "History",
                    description: "View previous calculations",
                    icon: "history",
                  }}
                  onClick={() => setActivePage("history")}
                />
              )}

            </div>

          </section>

        </main>
      )}

      {/* SEARCH */}

      {activePage === "search" && (
        <main className="search-page">

          <button
            className="back-button"
            onClick={goHome}
          >
            ← Back
          </button>

          <PageHeading
            label="FIND A TOOL"
            title="Search Calculators"
            description="Find the calculator you need"
          />

          <div className="search-input-container">

            <Icon type="search" />

            <input
              type="text"
              placeholder="Search calculators..."
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
              autoFocus
            />

          </div>

          <div className="search-results">

            {filteredCalculators.length > 0 ? (
              filteredCalculators.map((calculator) => (
                <CalculatorCard
                  key={calculator.id}
                  calculator={calculator}
                  onClick={() =>
                    openCalculator(calculator.id)
                  }
                />
              ))
            ) : (
              <div className="no-search-results">
                <h3>No calculator found</h3>

                <p>
                  Try searching for EMI, SIP, SWP,
                  loan or currency.
                </p>
              </div>
            )}

          </div>

        </main>
      )}

      {/* CALCULATOR */}

      {SelectedCalculator && (
        <main className="calculator-page">

          <button
            className="back-button"
            onClick={goHome}
          >
            ← All calculators
          </button>

          <SelectedCalculator
            addToHistory={addToHistory}
          />

        </main>
      )}

      {/* HISTORY */}

      {activePage === "history" && (
        <main className="history-page">

          <button
            className="back-button"
            onClick={goHome}
          >
            ← Back
          </button>

          <CalculationHistory
            history={history}
            clearHistory={clearHistory}
          />

        </main>
      )}

      {/* SETTINGS */}

      {activePage === "settings" && (
        <main className="history-page">

          <button
            className="back-button"
            onClick={goHome}
          >
            ← Back
          </button>

          <PageHeading
            label="PREFERENCES"
            title="Settings"
            description="Manage your FinCalc preferences"
          />

          <div className="settings-container">

            <div className="settings-card">

              <div className="settings-card-info">

                <span className="settings-label">
                  Appearance
                </span>

                <strong>
                  Choose your preferred theme
                </strong>

              </div>

              <div className="theme-options">

                <button
                  className={
                    theme === "light"
                      ? "theme-option active"
                      : "theme-option"
                  }
                  onClick={() => changeTheme("light")}
                >
                  ☀️
                  <span>Light</span>
                </button>

                <button
                  className={
                    theme === "dark"
                      ? "theme-option active"
                      : "theme-option"
                  }
                  onClick={() => changeTheme("dark")}
                >
                  🌙
                  <span>Dark</span>
                </button>

              </div>

            </div>

            <div className="settings-card">

              <div className="settings-card-info">

                <span className="settings-label">
                  Currency
                </span>

                <strong>₹ INR</strong>

                <small>
                  Indian Rupee is currently selected.
                </small>

              </div>

            </div>

            <div className="settings-card">

              <div className="settings-card-info">

                <span className="settings-label">
                  Data Management
                </span>

                <strong>
                  {history.length} saved calculations
                </strong>

                <small>
                  Your calculation history is stored
                  locally in this browser.
                </small>

              </div>

              <button
                className="reset-button"
                onClick={clearHistory}
                disabled={history.length === 0}
              >
                Clear History
              </button>

            </div>

            <div className="settings-card">

              <div className="settings-card-info">

                <span className="settings-label">
                  About FinCalc
                </span>

                <strong>FinCalc</strong>

                <small>
                  Plan smarter. Calculate better.
                </small>

                <small>
                  Version 1.0
                </small>

              </div>

            </div>

          </div>

        </main>
      )}

    </div>
  );
}

export default App;