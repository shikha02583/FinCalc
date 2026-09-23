import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { saveCalculation } from "../services/calculationService";

function LoanEligibility({ addToHistory }) {
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [existingEmi, setExistingEmi] = useState("");
  const [foir, setFoir] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [tenureYears, setTenureYears] = useState("");

  const [maxEmi, setMaxEmi] = useState(null);
  const [eligibleLoan, setEligibleLoan] = useState(null);
  const [maximumTotalEmi, setMaximumTotalEmi] = useState(null);

  async function calculateEligibility() {
    const income = Number(monthlyIncome);
    const currentEmi = Number(existingEmi);
    const foirPercentage = Number(foir);
    const rate = Number(annualRate);
    const years = Number(tenureYears);

    // Monthly income validation
    if (income <= 0) {
      alert("Please enter a valid monthly income.");
      return;
    }

    // Existing EMI validation
    if (currentEmi < 0) {
      alert("Existing EMI cannot be negative.");
      return;
    }

    // FOIR validation
    if (foirPercentage <= 0 || foirPercentage > 100) {
      alert("FOIR must be between 1% and 100%.");
      return;
    }

    // Interest rate validation
    if (rate < 0 || rate > 50) {
      alert("Interest rate must be between 0% and 50%.");
      return;
    }

    // Tenure validation
    if (years <= 0 || years > 40) {
      alert("Loan tenure must be between 1 and 40 years.");
      return;
    }

    const totalEmiCapacity = income * (foirPercentage / 100);
    const availableEmi = totalEmiCapacity - currentEmi;

    setMaximumTotalEmi(totalEmiCapacity);

    // Existing EMI already uses the entire EMI capacity
    if (availableEmi <= 0) {
      setMaxEmi(0);
      setEligibleLoan(0);

      addToHistory({
        type: "Loan Eligibility",
        details: `Monthly Income: ₹${income.toLocaleString(
          "en-IN"
        )} | Existing EMI: ₹${currentEmi.toLocaleString(
          "en-IN"
        )} | FOIR: ${foirPercentage}%`,
        result: "Eligible Loan Amount: ₹0",
        date: new Date().toLocaleString("en-IN"),
      });

      // Save calculation to backend
      try {
        await saveCalculation({
          calculationType: "Loan Eligibility",
          inputs: {
            monthlyIncome: income,
            existingEmi: currentEmi,
            foir: foirPercentage,
            annualInterestRate: rate,
            tenureYears: years,
          },
          result: {
            maximumEmiCapacity: Number(totalEmiCapacity.toFixed(2)),
            availableEmi: 0,
            eligibleLoanAmount: 0,
          },
        });
      } catch (error) {
        console.error("Failed to save loan eligibility:", error);
        alert(
          "Eligibility calculated, but failed to save it to your account."
        );
      }

      return;
    }

    const monthlyRate = rate / 12 / 100;
    const months = years * 12;

    const loan =
      monthlyRate === 0
        ? availableEmi * months
        : (availableEmi *
            (Math.pow(1 + monthlyRate, months) - 1)) /
          (monthlyRate *
            Math.pow(1 + monthlyRate, months));

    setMaxEmi(availableEmi);
    setEligibleLoan(loan);

    addToHistory({
      type: "Loan Eligibility",
      details: `Monthly Income: ₹${income.toLocaleString(
        "en-IN"
      )} | Existing EMI: ₹${currentEmi.toLocaleString(
        "en-IN"
      )} | FOIR: ${foirPercentage}% | Rate: ${rate}% | Tenure: ${years} years`,
      result: `Eligible Loan Amount: ₹${loan.toFixed(2)}`,
      date: new Date().toLocaleString("en-IN"),
    });

    // Save calculation to backend
    try {
      await saveCalculation({
        calculationType: "Loan Eligibility",
        inputs: {
          monthlyIncome: income,
          existingEmi: currentEmi,
          foir: foirPercentage,
          annualInterestRate: rate,
          tenureYears: years,
        },
        result: {
          maximumEmiCapacity: Number(totalEmiCapacity.toFixed(2)),
          availableEmi: Number(availableEmi.toFixed(2)),
          eligibleLoanAmount: Number(loan.toFixed(2)),
        },
      });
    } catch (error) {
      console.error("Failed to save loan eligibility:", error);
      alert(
        "Eligibility calculated, but failed to save it to your account."
      );
    }
  }

  function resetCalculator() {
    setMonthlyIncome("");
    setExistingEmi("");
    setFoir("");
    setAnnualRate("");
    setTenureYears("");
    setMaxEmi(null);
    setEligibleLoan(null);
    setMaximumTotalEmi(null);
  }

  const chartData =
    eligibleLoan !== null
      ? [
          {
            name: "Existing EMI",
            amount: Number(existingEmi),
          },
          {
            name: "Available EMI",
            amount: Number(maxEmi),
          },
          {
            name: "Max EMI Capacity",
            amount: Number(maximumTotalEmi),
          },
        ]
      : [];

  return (
    <div className="eligibility-calculator">
      <div className="eligibility-header">
        <div>
          <span className="calculator-badge">
            LOAN PLANNING
          </span>

          <h2>Loan Eligibility Calculator</h2>

          <p>
            Estimate the loan amount you may be eligible
            for based on your income, existing obligations
            and repayment capacity.
          </p>
        </div>
      </div>

      <div className="eligibility-layout">
        {/* INPUT CARD */}

        <div className="eligibility-input-card">
          <div className="card-heading">
            <div>
              <h3>Your Financial Details</h3>
              <p>
                Enter your details to check eligibility
              </p>
            </div>
          </div>

          <div className="eligibility-input-grid">
            <div className="input-group">
              <label>Monthly Income</label>

              <div className="input-wrapper">
                <span>₹</span>

                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={monthlyIncome}
                  onChange={(e) =>
                    setMonthlyIncome(e.target.value)
                  }
                />
              </div>
            </div>

            <div className="input-group">
              <label>Existing EMI</label>

              <div className="input-wrapper">
                <span>₹</span>

                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={existingEmi}
                  onChange={(e) =>
                    setExistingEmi(e.target.value)
                  }
                />
              </div>
            </div>

            <div className="input-group">
              <label>FOIR (%)</label>

              <div className="input-wrapper">
                <input
                  type="number"
                  placeholder="e.g. 50"
                  value={foir}
                  onChange={(e) =>
                    setFoir(e.target.value)
                  }
                />

                <span>%</span>
              </div>
            </div>

            <div className="input-group">
              <label>Interest Rate (%)</label>

              <div className="input-wrapper">
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 8.5"
                  value={annualRate}
                  onChange={(e) =>
                    setAnnualRate(e.target.value)
                  }
                />

                <span>%</span>
              </div>
            </div>

            <div className="input-group full-width">
              <label>Loan Tenure</label>

              <div className="input-wrapper">
                <input
                  type="number"
                  placeholder="e.g. 20"
                  value={tenureYears}
                  onChange={(e) =>
                    setTenureYears(e.target.value)
                  }
                />

                <span>Years</span>
              </div>
            </div>
          </div>

          <div className="eligibility-actions">
            <button
              className="eligibility-calculate-button"
              onClick={calculateEligibility}
            >
              Check Eligibility
            </button>

            <button
              className="eligibility-reset-button"
              onClick={resetCalculator}
            >
              Reset
            </button>
          </div>

          <div className="foir-info">
            <strong>What is FOIR?</strong>

            <p>
              FOIR (Fixed Obligations to Income Ratio)
              represents the portion of your monthly income
              that can be used toward EMIs.
            </p>
          </div>
        </div>

        {/* RESULT CARD */}

        <div className="eligibility-result-card">
          {eligibleLoan === null ? (
            <div className="eligibility-empty">
              <div className="empty-icon">✓</div>

              <h3>Check Your Eligibility</h3>

              <p>
                Enter your financial details and click
                "Check Eligibility" to see your estimated
                loan amount.
              </p>
            </div>
          ) : (
            <>
              <div className="result-label">
                ESTIMATED ELIGIBLE LOAN
              </div>

              <div className="eligible-loan-amount">
                ₹
                {eligibleLoan.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </div>

              <p className="result-description">
                Estimated maximum loan amount based on
                your available EMI capacity.
              </p>

              <div className="eligibility-summary-grid">
                <div className="eligibility-summary-item">
                  <span>Maximum EMI Capacity</span>

                  <strong>
                    ₹
                    {maximumTotalEmi.toLocaleString(
                      "en-IN",
                      {
                        maximumFractionDigits: 0,
                      }
                    )}
                  </strong>
                </div>

                <div className="eligibility-summary-item">
                  <span>Available EMI</span>

                  <strong>
                    ₹
                    {maxEmi.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </strong>
                </div>

                <div className="eligibility-summary-item">
                  <span>Existing EMI</span>

                  <strong>
                    ₹
                    {Number(existingEmi).toLocaleString(
                      "en-IN",
                      {
                        maximumFractionDigits: 0,
                      }
                    )}
                  </strong>
                </div>

                <div className="eligibility-summary-item">
                  <span>FOIR</span>

                  <strong>{foir}%</strong>
                </div>
              </div>

              <div className="eligibility-chart-section">
                <h3>EMI Capacity Breakdown</h3>

                <div className="eligibility-chart">
                  <ResponsiveContainer
                    width="100%"
                    height={240}
                  >
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 10,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                      />

                      <YAxis
                        tick={{ fontSize: 11 }}
                      />

                      <Tooltip
                        formatter={(value) =>
                          `₹${Number(
                            value
                          ).toLocaleString("en-IN")}`
                        }
                      />

                      <Bar
                        dataKey="amount"
                        fill="#7c3aed"
                        radius={[8, 8, 0, 0]}
                        barSize={42}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="eligibility-note">
                <strong>Important:</strong> This is an
                indicative estimate. Actual lender
                eligibility may vary depending on credit
                score, age, employment, lender policies,
                and other factors.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoanEligibility;
