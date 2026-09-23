import { useState } from "react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { saveCalculation } from "../services/calculationService";

function SWPCalculator({ addToHistory }) {
  const [initialInvestment, setInitialInvestment] = useState("");
  const [annualReturn, setAnnualReturn] = useState("");
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState("");
  const [withdrawalYears, setWithdrawalYears] = useState("");

  const [totalWithdrawn, setTotalWithdrawn] = useState(null);
  const [remainingCorpus, setRemainingCorpus] = useState(null);
  const [totalReturns, setTotalReturns] = useState(null);

  async function calculateSWP() {
    const investment = Number(initialInvestment);
    const returnRate = Number(annualReturn);
    const withdrawal = Number(monthlyWithdrawal);
    const years = Number(withdrawalYears);

    // Validation
    if (investment <= 0) {
      alert("Please enter a valid initial investment.");
      return;
    }

    if (returnRate < 0 || returnRate > 50) {
      alert("Expected return must be between 0% and 50%.");
      return;
    }

    if (withdrawal <= 0) {
      alert("Please enter a valid monthly withdrawal.");
      return;
    }

    if (years <= 0 || years > 40) {
      alert("Withdrawal period must be between 1 and 40 years.");
      return;
    }

    const monthlyRate = returnRate / 12 / 100;
    const months = Math.round(years * 12);

    let corpus = investment;
    let withdrawn = 0;

    // Calculate SWP
    for (let month = 1; month <= months; month++) {
      corpus = corpus * (1 + monthlyRate);

      const actualWithdrawal = Math.min(
        withdrawal,
        corpus
      );

      corpus -= actualWithdrawal;
      withdrawn += actualWithdrawal;

      if (corpus <= 0) {
        corpus = 0;
        break;
      }
    }

    const returns = Math.max(
      0,
      corpus + withdrawn - investment
    );

    // Update result states
    setTotalWithdrawn(withdrawn);
    setRemainingCorpus(corpus);
    setTotalReturns(returns);

    // Save calculation to local history
    addToHistory({
      type: "SWP Calculator",
      details: `Initial Investment: ₹${investment.toLocaleString(
        "en-IN"
      )} | Return: ${returnRate}% | Monthly Withdrawal: ₹${withdrawal.toLocaleString(
        "en-IN"
      )} | Period: ${years} years`,
      result: `Remaining Corpus: ₹${corpus.toFixed(2)}`,
      date: new Date().toLocaleString("en-IN"),
    });

    // Save calculation to MongoDB
    try {
      await saveCalculation({
        calculationType: "SWP Calculator",

        inputs: {
          initialInvestment: investment,
          annualReturn: returnRate,
          monthlyWithdrawal: withdrawal,
          withdrawalYears: years,
        },

        result: {
          totalWithdrawn: Number(withdrawn.toFixed(2)),
          remainingCorpus: Number(corpus.toFixed(2)),
          totalReturns: Number(returns.toFixed(2)),
        },
      });

      console.log("SWP calculation saved successfully!");
    } catch (error) {
      console.error("Failed to save SWP calculation:", error);
      alert("SWP calculated, but could not save to your account.");
    }
  }

  function resetCalculator() {
    setInitialInvestment("");
    setAnnualReturn("");
    setMonthlyWithdrawal("");
    setWithdrawalYears("");

    setTotalWithdrawn(null);
    setRemainingCorpus(null);
    setTotalReturns(null);
  }

  const chartData =
    totalWithdrawn !== null && remainingCorpus !== null
      ? [
          {
            name: "Total Withdrawn",
            value: totalWithdrawn,
          },
          {
            name: "Remaining Corpus",
            value: remainingCorpus,
          },
        ].filter((item) => item.value > 0)
      : [];

  const formatCurrency = (value) =>
    `₹${Number(value).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;

  return (
    <div className="swp-calculator">
      <div className="swp-header">
        <div>
          <span className="swp-label">
            SYSTEMATIC WITHDRAWAL PLAN
          </span>

          <h2>SWP Calculator</h2>

          <p>
            Plan your regular withdrawals, estimate the remaining
            investment value and understand how long your money may last.
          </p>
        </div>
      </div>

      <div className="swp-layout">
        {/* LEFT SIDE - INPUTS */}
        <div className="swp-input-card">
          <div className="swp-card-heading">
            <div className="swp-heading-icon">₹</div>

            <div>
              <h3>Investment Details</h3>
              <p>Enter your withdrawal plan</p>
            </div>
          </div>

          <div className="swp-input-group">
            <label>Initial Investment</label>

            <div className="swp-input-wrapper">
              <span>₹</span>

              <input
                type="number"
                placeholder="10,00,000"
                value={initialInvestment}
                onChange={(e) =>
                  setInitialInvestment(e.target.value)
                }
              />
            </div>
          </div>

          <div className="swp-input-group">
            <label>Expected Annual Return</label>

            <div className="swp-input-wrapper">
              <input
                type="number"
                placeholder="12"
                value={annualReturn}
                onChange={(e) =>
                  setAnnualReturn(e.target.value)
                }
              />

              <span>%</span>
            </div>
          </div>

          <div className="swp-input-group">
            <label>Monthly Withdrawal</label>

            <div className="swp-input-wrapper">
              <span>₹</span>

              <input
                type="number"
                placeholder="10,000"
                value={monthlyWithdrawal}
                onChange={(e) =>
                  setMonthlyWithdrawal(e.target.value)
                }
              />
            </div>
          </div>

          <div className="swp-input-group">
            <label>Withdrawal Period</label>

            <div className="swp-input-wrapper">
              <input
                type="number"
                placeholder="10"
                value={withdrawalYears}
                onChange={(e) =>
                  setWithdrawalYears(e.target.value)
                }
              />

              <span>Years</span>
            </div>
          </div>

          <div className="swp-button-row">
            <button
              className="swp-calculate-button"
              onClick={calculateSWP}
            >
              Calculate SWP
            </button>

            <button
              className="swp-reset-button"
              onClick={resetCalculator}
            >
              Reset
            </button>
          </div>
        </div>

        {/* RIGHT SIDE - RESULTS */}
        <div className="swp-result-card">
          {remainingCorpus === null ? (
            <div className="swp-empty-state">
              <div className="swp-empty-icon">₹</div>

              <h3>Your SWP results will appear here</h3>

              <p>
                Enter your investment, withdrawal amount, expected
                return and duration to calculate your SWP.
              </p>
            </div>
          ) : (
            <>
              <div className="swp-result-top">
                <div>
                  <span>REMAINING CORPUS</span>
                  <h2>{formatCurrency(remainingCorpus)}</h2>
                </div>

                <div className="swp-result-badge">
                  SWP
                </div>
              </div>

              <div className="swp-chart-section">
                <div className="swp-chart">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer
                      width="100%"
                      height={230}
                    >
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={90}
                          paddingAngle={3}
                          stroke="none"
                        >
                          {chartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                index === 0
                                  ? "#f97316"
                                  : "#fed7aa"
                              }
                            />
                          ))}
                        </Pie>

                        <Tooltip
                          formatter={(value) =>
                            formatCurrency(value)
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="swp-depleted">
                      <strong>₹0</strong>
                      <span>Corpus depleted</span>
                    </div>
                  )}
                </div>

                <div className="swp-legend">
                  <div className="swp-legend-item">
                    <span className="swp-dot withdrawn"></span>

                    <div>
                      <strong>
                        {formatCurrency(totalWithdrawn)}
                      </strong>

                      <small>Total Withdrawn</small>
                    </div>
                  </div>

                  <div className="swp-legend-item">
                    <span className="swp-dot remaining"></span>

                    <div>
                      <strong>
                        {formatCurrency(remainingCorpus)}
                      </strong>

                      <small>Remaining Corpus</small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="swp-summary-grid">
                <div className="swp-summary-item">
                  <span>Initial Investment</span>

                  <strong>
                    {formatCurrency(initialInvestment)}
                  </strong>
                </div>

                <div className="swp-summary-item">
                  <span>Total Withdrawn</span>

                  <strong>
                    {formatCurrency(totalWithdrawn)}
                  </strong>
                </div>

                <div className="swp-summary-item">
                  <span>Estimated Returns</span>

                  <strong>
                    {formatCurrency(totalReturns)}
                  </strong>
                </div>

                <div className="swp-summary-item">
                  <span>Withdrawal Period</span>

                  <strong>{withdrawalYears} Years</strong>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SWPCalculator;