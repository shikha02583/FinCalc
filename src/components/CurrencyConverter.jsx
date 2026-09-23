import { useState } from "react";
import { saveCalculation } from "../services/calculationService";

function CurrencyConverter({ addToHistory }) {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("INR");

  const [convertedAmount, setConvertedAmount] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [loading, setLoading] = useState(false);

  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
    { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  ];

  async function convertCurrency() {
    const value = Number(amount);

    // Validate amount
    if (!amount || !Number.isFinite(value) || value <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setLoading(true);
    setConvertedAmount(null);
    setExchangeRate(null);

    try {
      let rate;

      // Same currency conversion
      if (fromCurrency === toCurrency) {
        rate = 1;
      } else {
        // Fetch latest available exchange rate
        const response = await fetch(
          `https://api.frankfurter.dev/v2/rate/${fromCurrency}/${toCurrency}`
        );

        if (!response.ok) {
          throw new Error("Unable to fetch exchange rate.");
        }

        const data = await response.json();

        if (!data.rate || !Number.isFinite(Number(data.rate))) {
          throw new Error("Exchange rate not available.");
        }

        rate = Number(data.rate);
      }

      const converted = value * rate;

      setConvertedAmount(converted);
      setExchangeRate(rate);

      // Save to existing local history
      addToHistory({
        type: "Currency Converter",
        details: `${value} ${fromCurrency} → ${toCurrency}`,
        result: `Converted Amount: ${converted.toFixed(2)} ${toCurrency}`,
        date: new Date().toLocaleString("en-IN"),
      });

      // Save calculation to backend
      try {
        await saveCalculation({
          calculationType: "Currency Converter",
          inputs: {
            amount: value,
            fromCurrency,
            toCurrency,
          },
          result: {
            exchangeRate: rate,
            convertedAmount: Number(converted.toFixed(2)),
          },
        });
      } catch (error) {
        console.error("Failed to save currency conversion:", error);

        alert(
          "Conversion successful, but failed to save it to your account."
        );
      }
    } catch (error) {
      console.error("Currency conversion error:", error);

      alert(
        "Unable to fetch exchange rate. Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function swapCurrencies() {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);

    if (convertedAmount !== null) {
      setAmount(convertedAmount.toFixed(2));
      setConvertedAmount(null);
      setExchangeRate(null);
    }
  }

  function resetCalculator() {
    setAmount("");
    setFromCurrency("USD");
    setToCurrency("INR");
    setConvertedAmount(null);
    setExchangeRate(null);
  }

  const selectedFrom = currencies.find(
    (currency) => currency.code === fromCurrency
  );

  const selectedTo = currencies.find(
    (currency) => currency.code === toCurrency
  );

  return (
    <div className="currency-calculator">
      {/* HEADER */}
      <div className="currency-header">
        <div>
          <span className="currency-badge">
            LIVE EXCHANGE RATES
          </span>

          <h2>Currency Converter</h2>

          <p>
            Convert amounts between different currencies quickly and
            easily using the latest available exchange rates.
          </p>
        </div>
      </div>

      <div className="currency-layout">
        {/* INPUT CARD */}
        <div className="currency-input-card">
          <div className="currency-card-heading">
            <div>
              <h3>Convert Money</h3>
              <p>Choose currencies and enter an amount</p>
            </div>
          </div>

          {/* AMOUNT */}
          <div className="currency-amount-group">
            <label>Amount</label>

            <div className="currency-amount-input">
              <span>{selectedFrom?.symbol}</span>

              <input
                type="number"
                min="0"
                step="any"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* CURRENCY SELECTORS */}
          <div className="currency-selector-row">
            <div className="currency-select-group">
              <label>From</label>

              <select
                value={fromCurrency}
                onChange={(e) => {
                  setFromCurrency(e.target.value);
                  setConvertedAmount(null);
                  setExchangeRate(null);
                }}
              >
                {currencies.map((currency) => (
                  <option
                    key={currency.code}
                    value={currency.code}
                  >
                    {currency.code} — {currency.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="currency-swap-button"
              onClick={swapCurrencies}
              type="button"
              title="Swap currencies"
            >
              ⇄
            </button>

            <div className="currency-select-group">
              <label>To</label>

              <select
                value={toCurrency}
                onChange={(e) => {
                  setToCurrency(e.target.value);
                  setConvertedAmount(null);
                  setExchangeRate(null);
                }}
              >
                {currencies.map((currency) => (
                  <option
                    key={currency.code}
                    value={currency.code}
                  >
                    {currency.code} — {currency.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="currency-actions">
            <button
              className="currency-convert-button"
              onClick={convertCurrency}
              disabled={loading}
            >
              {loading ? "Fetching rate..." : "Convert Currency"}
            </button>

            <button
              className="currency-reset-button"
              onClick={resetCalculator}
              type="button"
            >
              Reset
            </button>
          </div>

          {/* INFO */}
          <div className="currency-info-box">
            <strong>Exchange rate information</strong>

            <p>
              Rates are fetched from the Frankfurter exchange-rate
              API. Rates are updated on working days and may vary
              from the rate offered by banks or payment providers.
            </p>
          </div>
        </div>

        {/* RESULT CARD */}
        <div className="currency-result-card">
          {convertedAmount === null ? (
            <div className="currency-empty">
              <div className="currency-empty-icon">⇄</div>

              <h3>Your conversion will appear here</h3>

              <p>
                Enter an amount, select your currencies, and click
                Convert Currency.
              </p>
            </div>
          ) : (
            <>
              <div className="currency-result-label">
                CONVERSION RESULT
              </div>

              <div className="currency-main-result">
                {selectedTo?.symbol}
                {convertedAmount.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </div>

              <div className="currency-result-code">
                {toCurrency}
              </div>

              <div className="currency-equation">
                <strong>
                  {selectedFrom?.symbol}
                  {Number(amount).toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}
                </strong>

                <span>{fromCurrency}</span>

                <b>=</b>

                <strong>
                  {selectedTo?.symbol}
                  {convertedAmount.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}
                </strong>

                <span>{toCurrency}</span>
              </div>

              <div className="currency-rate-card">
                <span>Exchange Rate</span>

                <strong>
                  1 {fromCurrency} ={" "}
                  {exchangeRate.toFixed(4)} {toCurrency}
                </strong>
              </div>

              <div className="currency-summary-grid">
                <div>
                  <span>From</span>
                  <strong>{fromCurrency}</strong>
                </div>

                <div>
                  <span>To</span>
                  <strong>{toCurrency}</strong>
                </div>

                <div>
                  <span>Amount</span>
                  <strong>
                    {Number(amount).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div>
                  <span>Rate</span>
                  <strong>{exchangeRate.toFixed(4)}</strong>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CurrencyConverter;

