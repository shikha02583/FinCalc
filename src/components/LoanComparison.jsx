import { useState } from "react";
import { saveCalculation } from "../services/calculationService";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

function LoanComparison({ addToHistory }) {
  const [loanAmountA, setLoanAmountA] = useState("");
  const [interestRateA, setInterestRateA] = useState("");
  const [loanTenureA, setLoanTenureA] = useState("");

  const [loanAmountB, setLoanAmountB] = useState("");
  const [interestRateB, setInterestRateB] = useState("");
  const [loanTenureB, setLoanTenureB] = useState("");

  const [loanA, setLoanA] = useState(null);
  const [loanB, setLoanB] = useState(null);

  function calculateLoan(principal, annualRate, years) {
    const monthlyRate = annualRate / 12 / 100;
    const months = years * 12;

    const emi =
      monthlyRate === 0
        ? principal / months
        : (principal *
            monthlyRate *
            Math.pow(1 + monthlyRate, months)) /
          (Math.pow(1 + monthlyRate, months) - 1);

    const totalPayment = emi * months;
    const totalInterest = totalPayment - principal;

    return {
      emi,
      totalInterest,
      totalPayment,
    };
  }

  async function compareLoans() {
    const amountA = Number(loanAmountA);
    const rateA = Number(interestRateA);
    const yearsA = Number(loanTenureA);

    const amountB = Number(loanAmountB);
    const rateB = Number(interestRateB);
    const yearsB = Number(loanTenureB);

    // Loan amount validation
    if (amountA <= 0 || amountB <= 0) {
      alert("Please enter valid loan amounts.");
      return;
    }

    // Interest rate validation
    if (
      rateA < 0 ||
      rateA > 50 ||
      rateB < 0 ||
      rateB > 50
    ) {
      alert("Interest rate must be between 0% and 50%.");
      return;
    }

    // Tenure validation
    if (
      yearsA <= 0 ||
      yearsA > 40 ||
      yearsB <= 0 ||
      yearsB > 40
    ) {
      alert("Loan tenure must be between 1 and 40 years.");
      return;
    }

    const resultA = calculateLoan(
      amountA,
      rateA,
      yearsA
    );

    const resultB = calculateLoan(
      amountB,
      rateB,
      yearsB
    );

    setLoanA(resultA);
    setLoanB(resultB);

    const betterLoan =
      resultA.totalInterest < resultB.totalInterest
        ? "Loan A has lower total interest."
        : resultB.totalInterest < resultA.totalInterest
        ? "Loan B has lower total interest."
        : "Both loans have the same total interest.";

    // Save calculation to local history
    addToHistory({
      type: "Loan Comparison",
      details: `Loan A: ₹${amountA.toLocaleString(
        "en-IN"
      )} at ${rateA}% for ${yearsA} years | Loan B: ₹${amountB.toLocaleString(
        "en-IN"
      )} at ${rateB}% for ${yearsB} years`,
      result: betterLoan,
      date: new Date().toLocaleString("en-IN"),
    });

    // Save calculation to MongoDB
    try {
      await saveCalculation({
        calculationType: "Loan Comparison",

        inputs: {
          loanA: {
            loanAmount: amountA,
            interestRate: rateA,
            loanTenure: yearsA,
          },

          loanB: {
            loanAmount: amountB,
            interestRate: rateB,
            loanTenure: yearsB,
          },
        },

        result: {
          loanA: {
            emi: Number(resultA.emi.toFixed(2)),
            totalInterest: Number(
              resultA.totalInterest.toFixed(2)
            ),
            totalPayment: Number(
              resultA.totalPayment.toFixed(2)
            ),
          },

          loanB: {
            emi: Number(resultB.emi.toFixed(2)),
            totalInterest: Number(
              resultB.totalInterest.toFixed(2)
            ),
            totalPayment: Number(
              resultB.totalPayment.toFixed(2)
            ),
          },

          betterLoan,
          interestDifference: Number(
            Math.abs(
              resultA.totalInterest -
                resultB.totalInterest
            ).toFixed(2)
          ),
        },
      });

      console.log("Loan comparison saved successfully!");
    } catch (error) {
      console.error(
        "Failed to save loan comparison:",
        error
      );

      alert(
        "Loan comparison completed, but could not save to your account."
      );
    }
  }

  function resetCalculator() {
    setLoanAmountA("");
    setInterestRateA("");
    setLoanTenureA("");

    setLoanAmountB("");
    setInterestRateB("");
    setLoanTenureB("");

    setLoanA(null);
    setLoanB(null);
  }

  const formatCurrency = (value) =>
    `₹${Number(value).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;

  const chartData =
    loanA && loanB
      ? [
          {
            name: "Monthly EMI",
            "Loan A": loanA.emi,
            "Loan B": loanB.emi,
          },
          {
            name: "Total Interest",
            "Loan A": loanA.totalInterest,
            "Loan B": loanB.totalInterest,
          },
          {
            name: "Total Payment",
            "Loan A": loanA.totalPayment,
            "Loan B": loanB.totalPayment,
          },
        ]
      : [];

  const interestDifference =
    loanA && loanB
      ? Math.abs(
          loanA.totalInterest - loanB.totalInterest
        )
      : 0;

  const betterLoan =
    loanA && loanB
      ? loanA.totalInterest < loanB.totalInterest
        ? "Loan A"
        : loanB.totalInterest < loanA.totalInterest
        ? "Loan B"
        : "Both Loans"
      : "";

  return (
    <div className="loan-comparison">
      {/* HEADER */}
      <div className="loan-comparison-header">
        <span className="calculator-badge">
          LOAN COMPARISON
        </span>

        <h2>Compare Loans</h2>

        <p>
          Compare different loan options based on
          interest rate, monthly EMI, total interest
          and overall repayment amount.
        </p>
      </div>

      {/* INPUT SECTION */}
      <div className="loan-input-grid">
        {/* LOAN A */}
        <div className="loan-input-card loan-a-card">
          <div className="loan-card-heading">
            <div className="loan-icon loan-a-icon">
              A
            </div>

            <div>
              <h3>Loan A</h3>
              <p>First loan option</p>
            </div>
          </div>

          <div className="loan-input-group">
            <label>Loan Amount</label>

            <div className="loan-input-wrapper">
              <span>₹</span>

              <input
                type="number"
                placeholder="10,00,000"
                value={loanAmountA}
                onChange={(e) =>
                  setLoanAmountA(e.target.value)
                }
              />
            </div>
          </div>

          <div className="loan-input-group">
            <label>Interest Rate</label>

            <div className="loan-input-wrapper">
              <input
                type="number"
                placeholder="8.5"
                value={interestRateA}
                onChange={(e) =>
                  setInterestRateA(e.target.value)
                }
              />

              <span>%</span>
            </div>
          </div>

          <div className="loan-input-group">
            <label>Loan Tenure</label>

            <div className="loan-input-wrapper">
              <input
                type="number"
                placeholder="10"
                value={loanTenureA}
                onChange={(e) =>
                  setLoanTenureA(e.target.value)
                }
              />

              <span>Years</span>
            </div>
          </div>
        </div>

        {/* LOAN B */}
        <div className="loan-input-card loan-b-card">
          <div className="loan-card-heading">
            <div className="loan-icon loan-b-icon">
              B
            </div>

            <div>
              <h3>Loan B</h3>
              <p>Second loan option</p>
            </div>
          </div>

          <div className="loan-input-group">
            <label>Loan Amount</label>

            <div className="loan-input-wrapper">
              <span>₹</span>

              <input
                type="number"
                placeholder="10,00,000"
                value={loanAmountB}
                onChange={(e) =>
                  setLoanAmountB(e.target.value)
                }
              />
            </div>
          </div>

          <div className="loan-input-group">
            <label>Interest Rate</label>

            <div className="loan-input-wrapper">
              <input
                type="number"
                placeholder="9"
                value={interestRateB}
                onChange={(e) =>
                  setInterestRateB(e.target.value)
                }
              />

              <span>%</span>
            </div>
          </div>

          <div className="loan-input-group">
            <label>Loan Tenure</label>

            <div className="loan-input-wrapper">
              <input
                type="number"
                placeholder="10"
                value={loanTenureB}
                onChange={(e) =>
                  setLoanTenureB(e.target.value)
                }
              />

              <span>Years</span>
            </div>
          </div>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="loan-button-row">
        <button
          className="loan-compare-button"
          onClick={compareLoans}
        >
          Compare Loans
        </button>

        <button
          className="loan-reset-button"
          onClick={resetCalculator}
        >
          Reset
        </button>
      </div>

      {/* RESULTS */}
      {loanA && loanB && (
        <div className="loan-results">
          {/* WINNER */}
          <div className="loan-winner">
            <div className="winner-icon">✓</div>

            <div>
              <span>BETTER OPTION</span>

              <h3>
                {betterLoan === "Both Loans"
                  ? "Both loans have the same interest cost"
                  : `${betterLoan} has lower total interest`}
              </h3>

              {betterLoan !== "Both Loans" && (
                <p>
                  Potential interest difference:{" "}
                  <strong>
                    {formatCurrency(interestDifference)}
                  </strong>
                </p>
              )}
            </div>
          </div>

          {/* LOAN RESULT CARDS */}
          <div className="loan-result-grid">
            <div
              className={`loan-result-card ${
                betterLoan === "Loan A"
                  ? "better-loan"
                  : ""
              }`}
            >
              <div className="loan-result-title">
                <span className="result-letter loan-a-result">
                  A
                </span>

                <div>
                  <h3>Loan A</h3>

                  {betterLoan === "Loan A" && (
                    <small>Better option</small>
                  )}
                </div>
              </div>

              <div className="loan-result-item">
                <span>Monthly EMI</span>
                <strong>{formatCurrency(loanA.emi)}</strong>
              </div>

              <div className="loan-result-item">
                <span>Total Interest</span>
                <strong>
                  {formatCurrency(loanA.totalInterest)}
                </strong>
              </div>

              <div className="loan-result-item">
                <span>Total Payment</span>
                <strong>
                  {formatCurrency(loanA.totalPayment)}
                </strong>
              </div>
            </div>

            <div
              className={`loan-result-card ${
                betterLoan === "Loan B"
                  ? "better-loan"
                  : ""
              }`}
            >
              <div className="loan-result-title">
                <span className="result-letter loan-b-result">
                  B
                </span>

                <div>
                  <h3>Loan B</h3>

                  {betterLoan === "Loan B" && (
                    <small>Better option</small>
                  )}
                </div>
              </div>

              <div className="loan-result-item">
                <span>Monthly EMI</span>
                <strong>{formatCurrency(loanB.emi)}</strong>
              </div>

              <div className="loan-result-item">
                <span>Total Interest</span>
                <strong>
                  {formatCurrency(loanB.totalInterest)}
                </strong>
              </div>

              <div className="loan-result-item">
                <span>Total Payment</span>
                <strong>
                  {formatCurrency(loanB.totalPayment)}
                </strong>
              </div>
            </div>
          </div>

          {/* CHART */}
          <div className="loan-chart-card">
            <div className="loan-chart-heading">
              <div>
                <h3>Loan Cost Comparison</h3>

                <p>
                  Compare the financial impact of both
                  loans.
                </p>
              </div>
            </div>

            <div className="loan-chart">
              <ResponsiveContainer
                width="100%"
                height={320}
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
                    tick={{ fontSize: 11 }}
                  />

                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) =>
                      value >= 100000
                        ? `₹${(value / 100000).toFixed(0)}L`
                        : `₹${(value / 1000).toFixed(0)}K`
                    }
                  />

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(value)
                    }
                  />

                  <Legend />

                  <Bar
                    dataKey="Loan A"
                    fill="#6366f1"
                    radius={[5, 5, 0, 0]}
                  />

                  <Bar
                    dataKey="Loan B"
                    fill="#f59e0b"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoanComparison;