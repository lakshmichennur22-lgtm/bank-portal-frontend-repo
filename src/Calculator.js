import { useState } from "react";
import "./Calculator.css";

const Calculator = () => {
  const [type, setType] = useState("FD");
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    principal: "",
    rate: "",
    time: "",
    monthlyInvestment: "",
    tenure: "",
    frequency: "",
  });

  const backendUrl = process.env.REACT_APP_API_URL; // Replace with your actual backend URL
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCalculate = async () => {
    let url = "";
    const { principal, rate, time, monthlyInvestment, tenure, frequency } = formData;

    switch (type) {
      case "FD":
        url = `${backendUrl}/calculator/fd?principal=${principal}&rate=${rate}&time=${time}`;
        break;
      case "RD":
        url = `${backendUrl}/calculator/rd?monthlyInvestment=${monthlyInvestment}&rate=${rate}&time=${time}`;
        break;
      case "EMI":
        url = `${backendUrl}/calculator/emi?principal=${principal}&rate=${rate}&tenure=${tenure}`;
        break;
      case "Simple Interest":
        url = `${backendUrl}/calculator/simple-interest?principal=${principal}&rate=${rate}&time=${time}`;
        break;
      case "Compound Interest":
        url = `${backendUrl}/calculator/compound-interest?principal=${principal}&rate=${rate}&time=${time}&frequency=${frequency}`;
        break;
      default:
        return;
    }

    try {
      const response = await fetch(url, {
        headers: {
          "Ocp-Apim-Subscription-Key": process.env.REACT_APP_APIM_SUBSCRIPTION_KEY,
        },
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: "Error calculating result. Check inputs or server." });
    }
  };

  return (
    <div className="calculator">
      <h2>{type} Calculator</h2>
      <div className="tabs">
        {["FD", "RD", "EMI", "Simple Interest", "Compound Interest"].map((t) => (
          <button key={t} onClick={() => setType(t)} className={type === t ? "active" : ""}>
            {t}
          </button>
        ))}
      </div>

      <div className="form">
        {["FD", "Simple Interest"].includes(type) && (
          <>
            <input type="number" name="principal" placeholder="Principal Amount" value={formData.principal} onChange={handleChange} />
            <input type="number" name="rate" placeholder="Interest Rate (%)" value={formData.rate} onChange={handleChange} />
            <input type="number" name="time" placeholder="Time (Years)" value={formData.time} onChange={handleChange} />
          </>
        )}

        {type === "RD" && (
          <>
            <input type="number" name="monthlyInvestment" placeholder="Monthly Investment" value={formData.monthlyInvestment} onChange={handleChange} />
            <input type="number" name="rate" placeholder="Interest Rate (%)" value={formData.rate} onChange={handleChange} />
            <input type="number" name="time" placeholder="Time (Years)" value={formData.time} onChange={handleChange} />
          </>
        )}

        {type === "EMI" && (
          <>
            <input type="number" name="principal" placeholder="Principal Amount" value={formData.principal} onChange={handleChange} />
            <input type="number" name="rate" placeholder="Annual Interest Rate (%)" value={formData.rate} onChange={handleChange} />
            <input type="number" name="tenure" placeholder="Tenure (Months)" value={formData.tenure} onChange={handleChange} />
          </>
        )}

        {type === "Compound Interest" && (
          <>
            <input type="number" name="principal" placeholder="Principal Amount" value={formData.principal} onChange={handleChange} />
            <input type="number" name="rate" placeholder="Interest Rate (%)" value={formData.rate} onChange={handleChange} />
            <input type="number" name="time" placeholder="Time (Years)" value={formData.time} onChange={handleChange} />
            <input type="number" name="frequency" placeholder="Compounding Frequency (Optional)" value={formData.frequency} onChange={handleChange} />
          </>
        )}

        <button onClick={handleCalculate}>Calculate</button>
      </div>

      {result && (
        <div className="result">
          <h3>Result</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Calculator;
