import { useState } from "react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { saveCalculation } from "../services/calculationService";

function EMICalculator({ addToHistory }) {
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTenure, setLoanTenure] = useState("");

  const [emi, setEmi] = useState(null);
  const [totalInterest, setTotalInterest] = useState(null);
  const [totalPayment, setTotalPayment] = useState(null);

  const [repaymentSchedule, setRepaymentSchedule] = useState([]);
  const [yearlySummary, setYearlySummary] = useState([]);

  async function calculateEMI() {
    const principal = Number(loanAmount);
    const annualRate = Number(interestRate);
    const years = Number(loanTenure);

    // Validation
    if (!loanAmount || principal <= 0) {
      alert("Please enter a valid loan amount.");
      return;
    }

    if (
      interestRate === "" ||
      annualRate < 0 ||
      annualRate > 50
    ) {
      alert("Interest rate must be between 0% and 50%.");
      return;
    }

    if (
      !loanTenure ||
      years <= 0 ||
      years > 40
    ) {
      alert("Loan tenure must be between 1 and 40 years.");
      return;
    }

    const monthlyRate = annualRate / 12 / 100;
    const months = years * 12;

    // Calculate EMI
    const calculatedEMI =
      monthlyRate === 0
        ? principal / months
        : (principal *
            monthlyRate *
            Math.pow(1 + monthlyRate, months)) /
          (Math.pow(1 + monthlyRate, months) - 1);

    const calculatedTotalPayment = calculatedEMI * months;

    const calculatedTotalInterest =
      calculatedTotalPayment - principal;

    // Generate repayment schedule
    const schedule = [];
    let remainingBalance = principal;

    for (let month = 1; month <= months; month++) {
      const monthlyInterest = remainingBalance * monthlyRate;

      const monthlyPrincipal =
        calculatedEMI - monthlyInterest;

      remainingBalance -= monthlyPrincipal;

      const balance =
        month === months
          ? 0
          : Math.max(remainingBalance, 0);

      schedule.push({
        month,
        emi: calculatedEMI,
        principal: monthlyPrincipal,
        interest: monthlyInterest,
        balance,
      });
    }

    // Generate year-wise summary
    const summary = [];

    for (let year = 1; year <= years; year++) {
      const startIndex = (year - 1) * 12;
      const endIndex = Math.min(year * 12, schedule.length);

      const yearPayments = schedule.slice(
        startIndex,
        endIndex
      );

      const principalPaid = yearPayments.reduce(
        (total, payment) =>
          total + payment.principal,
        0
      );

      const interestPaid = yearPayments.reduce(
        (total, payment) =>
          total + payment.interest,
        0
      );

      const closingBalance =
        yearPayments[yearPayments.length - 1]?.balance || 0;

      summary.push({
        year,
        principal: principalPaid,
        interest: interestPaid,
        balance: closingBalance,
      });
    }

    // Update UI
    setEmi(calculatedEMI);
    setTotalInterest(calculatedTotalInterest);
    setTotalPayment(calculatedTotalPayment);
    setRepaymentSchedule(schedule);
    setYearlySummary(summary);

    // Prepare calculation history data
    const calculationData = {
      type: "EMI Calculator",

      details: `Loan Amount: ₹${principal.toLocaleString(
        "en-IN"
      )} | Interest Rate: ${annualRate}% | Tenure: ${years} years`,

      result: `Monthly EMI: ₹${calculatedEMI.toFixed(2)}`,

      date: new Date().toLocaleString("en-IN"),
    };

    // Save to existing local history
    if (addToHistory) {
      addToHistory(calculationData);
    }

    // Save to MongoDB
    try {
      await saveCalculation({
        calculationType: "EMI Calculator",

        inputs: {
          loanAmount: principal,
          interestRate: annualRate,
          loanTenure: years,
        },

        result: {
          emi: Number(calculatedEMI.toFixed(2)),
          totalInterest: Number(
            calculatedTotalInterest.toFixed(2)
          ),
          totalPayment: Number(
            calculatedTotalPayment.toFixed(2)
          ),
        },
      });

      console.log("EMI calculation saved to MongoDB!");
    } catch (error) {
      console.error(
        "MongoDB save failed:",
        error.message
      );

      alert(
        "EMI calculated, but could not save to your account. " +
        error.message
      );
    }
  }

  function resetCalculator() {
    setLoanAmount("");
    setInterestRate("");
    setLoanTenure("");

    setEmi(null);
    setTotalInterest(null);
    setTotalPayment(null);

    setRepaymentSchedule([]);
    setYearlySummary([]);
  }

  const chartData =
    emi !== null
      ? [
          {
            name: "Principal",
            value: Number(loanAmount),
          },
          {
            name: "Interest",
            value: totalInterest,
          },
        ]
      : [];

  return (
    <div className="emi-calculator-wrapper">
      <div className="emi-header">
        <div>
          <p className="calculator-eyebrow">
            LOAN PLANNING
          </p>

          <h2>EMI Calculator</h2>

          <span>
            Calculate your monthly EMI, total interest, total
            payment and understand the complete cost of your
            loan.
          </span>
        </div>
      </div>

      <div className="emi-layout">
        {/* LEFT SIDE */}
        <div className="emi-input-card">
          <h3>Loan Details</h3>

          <p className="emi-card-subtitle">
            Enter your loan information
          </p>

          <div className="emi-input-group">
            <label>Loan Amount</label>

            <div className="currency-input">
              <span>₹</span>

              <input
                type="number"
                placeholder="10,00,000"
                value={loanAmount}
                onChange={(e) =>
                  setLoanAmount(e.target.value)
                }
              />
            </div>
          </div>

          <div className="emi-input-group">
            <label>Interest Rate</label>

            <div className="suffix-input">
              <input
                type="number"
                step="0.01"
                placeholder="8.5"
                value={interestRate}
                onChange={(e) =>
                  setInterestRate(e.target.value)
                }
              />

              <span>%</span>
            </div>
          </div>

          <div className="emi-input-group">
            <label>Loan Tenure</label>

            <div className="suffix-input">
              <input
                type="number"
                placeholder="5"
                value={loanTenure}
                onChange={(e) =>
                  setLoanTenure(e.target.value)
                }
              />

              <span>Years</span>
            </div>
          </div>

          <div className="emi-button-row">
            <button
              className="emi-calculate-button"
              onClick={calculateEMI}
            >
              Calculate EMI
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
        <div className="emi-result-card">
          {emi !== null ? (
            <>
              <div className="emi-main-result">
                <span>MONTHLY EMI</span>

                <strong>
                  ₹
                  {emi.toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  })}
                </strong>
              </div>

              <div className="emi-chart-section">
                <div className="emi-chart">
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
                                ? "#2387bd"
                                : "#dceef7"
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

                <div className="chart-legend">
                  <div>
                    <span className="legend-dot principal-dot"></span>

                    <p>Principal</p>

                    <strong>
                      ₹
                      {Number(
                        loanAmount
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div>
                    <span className="legend-dot interest-dot"></span>

                    <p>Total Interest</p>

                    <strong>
                      ₹
                      {Number(
                        totalInterest
                      ).toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="emi-summary-grid">
                <div>
                  <span>Total Interest</span>

                  <strong>
                    ₹
                    {totalInterest.toLocaleString(
                      "en-IN",
                      {
                        maximumFractionDigits: 0,
                      }
                    )}
                  </strong>
                </div>

                <div>
                  <span>Total Payment</span>

                  <strong>
                    ₹
                    {totalPayment.toLocaleString(
                      "en-IN",
                      {
                        maximumFractionDigits: 0,
                      }
                    )}
                  </strong>
                </div>
              </div>
            </>
          ) : (
            <div className="emi-empty-state">
              <div className="empty-calculator-icon">
                ₹
              </div>

              <h3>
                Your EMI summary will appear here
              </h3>

              <p>
                Enter your loan details and calculate your
                EMI to see the breakdown.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* YEAR-WISE SUMMARY */}
      {yearlySummary.length > 0 && (
        <div className="yearly-summary">
          <div className="yearly-summary-header">
            <h3>Year-wise Repayment Summary</h3>

            <p>
              See how your loan changes year by year
            </p>
          </div>

          <div className="yearly-table-wrapper">
            <table className="yearly-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Principal Paid</th>
                  <th>Interest Paid</th>
                  <th>Closing Balance</th>
                </tr>
              </thead>

              <tbody>
                {yearlySummary.map((item) => (
                  <tr key={item.year}>
                    <td>Year {item.year}</td>

                    <td>
                      ₹
                      {item.principal.toLocaleString(
                        "en-IN",
                        {
                          maximumFractionDigits: 0,
                        }
                      )}
                    </td>

                    <td>
                      ₹
                      {item.interest.toLocaleString(
                        "en-IN",
                        {
                          maximumFractionDigits: 0,
                        }
                      )}
                    </td>

                    <td>
                      ₹
                      {item.balance.toLocaleString(
                        "en-IN",
                        {
                          maximumFractionDigits: 0,
                        }
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPAYMENT SCHEDULE */}
      {repaymentSchedule.length > 0 && (
        <div className="repayment-schedule">
          <div className="repayment-header">
            <div>
              <h3>Repayment Schedule</h3>

              <p>
                Monthly breakdown of your loan repayment
              </p>
            </div>
          </div>

          <div className="repayment-table-wrapper">
            <table className="repayment-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>EMI</th>
                  <th>Principal</th>
                  <th>Interest</th>
                  <th>Remaining Balance</th>
                </tr>
              </thead>

              <tbody>
                {repaymentSchedule.map((payment) => (
                  <tr key={payment.month}>
                    <td>{payment.month}</td>

                    <td>
                      ₹
                      {payment.emi.toLocaleString(
                        "en-IN",
                        {
                          maximumFractionDigits: 0,
                        }
                      )}
                    </td>

                    <td>
                      ₹
                      {payment.principal.toLocaleString(
                        "en-IN",
                        {
                          maximumFractionDigits: 0,
                        }
                      )}
                    </td>

                    <td>
                      ₹
                      {payment.interest.toLocaleString(
                        "en-IN",
                        {
                          maximumFractionDigits: 0,
                        }
                      )}
                    </td>

                    <td>
                      ₹
                      {payment.balance.toLocaleString(
                        "en-IN",
                        {
                          maximumFractionDigits: 0,
                        }
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default EMICalculator;