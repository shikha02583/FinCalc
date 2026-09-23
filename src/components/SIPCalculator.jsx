import { useState } from "react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { saveCalculation } from "../services/calculationService";

function SIPCalculator({ addToHistory }) {
  const [monthlyInvestment, setMonthlyInvestment] = useState("");
  const [annualReturn, setAnnualReturn] = useState("");
  const [investmentYears, setInvestmentYears] = useState("");

  const [totalInvested, setTotalInvested] = useState(null);
  const [estimatedReturns, setEstimatedReturns] = useState(null);
  const [futureValue, setFutureValue] = useState(null);

  async function calculateSIP() {
    const investment = Number(monthlyInvestment);
    const returnRate = Number(annualReturn);
    const years = Number(investmentYears);

    // Validation
    if (investment <= 0) {
      alert("Please enter a valid monthly investment.");
      return;
    }

    if (returnRate < 0 || returnRate > 50) {
      alert("Expected return must be between 0% and 50%.");
      return;
    }

    if (years <= 0 || years > 40) {
      alert("Investment period must be between 1 and 40 years.");
      return;
    }

    const monthlyRate = returnRate / 12 / 100;
    const months = years * 12;

    // Calculate SIP future value
    const calculatedFutureValue =
      monthlyRate === 0
        ? investment * months
        : investment *
          ((Math.pow(1 + monthlyRate, months) - 1) /
            monthlyRate) *
          (1 + monthlyRate);

    const calculatedTotalInvested = investment * months;

    const calculatedEstimatedReturns =
      calculatedFutureValue - calculatedTotalInvested;

    // Update result states
    setTotalInvested(calculatedTotalInvested);
    setEstimatedReturns(calculatedEstimatedReturns);
    setFutureValue(calculatedFutureValue);

    // Save calculation to local history
    addToHistory({
      type: "SIP Calculator",
      details: `Monthly Investment: ₹${investment.toLocaleString(
        "en-IN"
      )} | Return: ${returnRate}% | Period: ${years} years`,
      result: `Future Value: ₹${calculatedFutureValue.toFixed(2)}`,
      date: new Date().toLocaleString("en-IN"),
    });

    // Save calculation to MongoDB
    try {
      await saveCalculation({
        calculationType: "SIP Calculator",

        inputs: {
          monthlyInvestment: investment,
          annualReturn: returnRate,
          investmentYears: years,
        },

        result: {
          totalInvested: Number(calculatedTotalInvested.toFixed(2)),
          estimatedReturns: Number(calculatedEstimatedReturns.toFixed(2)),
          futureValue: Number(calculatedFutureValue.toFixed(2)),
        },
      });

      console.log("SIP calculation saved successfully!");
    } catch (error) {
      console.error("Failed to save SIP calculation:", error);
      alert("SIP calculated, but could not save to your account.");
    }
  }

  function resetCalculator() {
    setMonthlyInvestment("");
    setAnnualReturn("");
    setInvestmentYears("");

    setTotalInvested(null);
    setEstimatedReturns(null);
    setFutureValue(null);
  }

  const chartData =
    futureValue !== null
      ? [
          {
            name: "Invested Amount",
            value: totalInvested,
          },
          {
            name: "Estimated Returns",
            value: estimatedReturns,
          },
        ]
      : [];

  return (
    <div className="sip-calculator-wrapper">
      <div className="sip-header">
        <div>
          <p className="calculator-eyebrow">
            INVESTMENT PLANNING
          </p>

          <h2>SIP Calculator</h2>

          <span>
            Estimate your SIP returns, maturity amount, total
            investment and potential wealth growth over time.
          </span>
        </div>
      </div>

      <div className="sip-layout">
        {/* LEFT SIDE */}
        <div className="sip-input-card">
          <h3>Investment Details</h3>

          <p className="sip-card-subtitle">
            Enter your investment information
          </p>

          <div className="sip-input-group">
            <label>Monthly Investment</label>

            <div className="currency-input">
              <span>₹</span>

              <input
                type="number"
                placeholder="10,000"
                value={monthlyInvestment}
                onChange={(e) =>
                  setMonthlyInvestment(e.target.value)
                }
              />
            </div>
          </div>

          <div className="sip-input-group">
            <label>Expected Annual Return</label>

            <div className="suffix-input">
              <input
                type="number"
                step="0.01"
                placeholder="12"
                value={annualReturn}
                onChange={(e) =>
                  setAnnualReturn(e.target.value)
                }
              />

              <span>%</span>
            </div>
          </div>

          <div className="sip-input-group">
            <label>Investment Period</label>

            <div className="suffix-input">
              <input
                type="number"
                placeholder="10"
                value={investmentYears}
                onChange={(e) =>
                  setInvestmentYears(e.target.value)
                }
              />

              <span>Years</span>
            </div>
          </div>

          <div className="emi-button-row">
            <button
              className="emi-calculate-button"
              onClick={calculateSIP}
            >
              Calculate SIP
            </button>

            <button
              className="emi-reset-button"
              onClick={resetCalculator}
            >
              Reset
            </button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="sip-result-card">
          {futureValue !== null ? (
            <>
              <div className="sip-main-result">
                <span>ESTIMATED FUTURE VALUE</span>

                <strong>
                  ₹
                  {futureValue.toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  })}
                </strong>
              </div>

              <div className="sip-chart-section">
                <div className="sip-chart">
                  <ResponsiveContainer
                    width="100%"
                    height={220}
                  >
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={62}
                        outerRadius={88}
                        paddingAngle={3}
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              index === 0
                                ? "#2d9b61"
                                : "#dcefe5"
                            }
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        formatter={(value) =>
                          `₹${Number(
                            value
                          ).toLocaleString("en-IN")}`
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="sip-chart-legend">
                  <div>
                    <span className="sip-legend-dot invested-dot"></span>

                    <p>Invested Amount</p>

                    <strong>
                      ₹
                      {Number(
                        totalInvested
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div>
                    <span className="sip-legend-dot returns-dot"></span>

                    <p>Estimated Returns</p>

                    <strong>
                      ₹
                      {Number(
                        estimatedReturns
                      ).toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="sip-summary-grid">
                <div>
                  <span>Total Invested</span>

                  <strong>
                    ₹
                    {totalInvested.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </strong>
                </div>

                <div>
                  <span>Estimated Returns</span>

                  <strong>
                    ₹
                    {estimatedReturns.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </strong>
                </div>
              </div>
            </>
          ) : (
            <div className="sip-empty-state">
              <div className="empty-sip-icon">₹</div>

              <h3>Your SIP summary will appear here</h3>

              <p>
                Enter your investment details and calculate
                your SIP to see the projected growth.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SIPCalculator;