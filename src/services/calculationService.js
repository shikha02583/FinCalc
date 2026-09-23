const API_URL = "http://localhost:5000/api/calculations";

// SAVE CALCULATION TO MONGODB
export async function saveCalculation(calculation) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login first.");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(calculation),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to save calculation.");
  }

  return data;
}

// GET USER'S CALCULATIONS
export async function getCalculations() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login first.");
  }

  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch calculations.");
  }

  return data;
}

// CLEAR LOGGED-IN USER'S CALCULATION HISTORY
export async function clearCalculationHistory() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login first.");
  }

  const response = await fetch(`${API_URL}/clear`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to clear history.");
  }

  return data;
}