import { useState } from "react";
import "./App.css";
import Calculator from "./Calculator"; // Make sure Calculator.js exists in src/

function App() {
  const [selectedMenu, setSelectedMenu] = useState("Home");

  const menuItems = [
    "Home",
    "About Bank",
    "Financial Services",
    "Services",
    "Loans",
    "Investments",
    "Calculator",
  ];

  return (
    <div className="app-container">
      <aside className="sidebar">
        {menuItems.map((item) => (
          <button
            key={item}
            className={`menu-item ${selectedMenu === item ? "active" : ""}`}
            onClick={() => setSelectedMenu(item)}
          >
            {item}
          </button>
        ))}
      </aside>

      <main className="main-content">
        {selectedMenu === "Home" && (
          <div>
            <h2>Welcome to NetBank</h2>
            <p>Your trusted digital banking portal for all financial needs.</p>
          </div>
        )}

        {selectedMenu === "About Bank" && (
          <div>
            <h2>About NetBank</h2>
            <p>
              NetBank is a secure and customer-first bank, offering online
              banking solutions for all your financial activities.
            </p>
          </div>
        )}

        {selectedMenu === "Financial Services" && (
          <div>
            <h2>Financial Services</h2>
            <p>
              We offer wealth management, insurance, mutual funds, tax
              planning, and more.
            </p>
          </div>
        )}

        {selectedMenu === "Services" && (
          <div>
            <h2>Services</h2>
            <p>
              NetBank provides mobile banking, internet banking, and customer
              support round the clock.
            </p>
          </div>
        )}

        {selectedMenu === "Loans" && (
          <div>
            <h2>Loans</h2>
            <p>
              Get personal, home, vehicle, or education loans at the best
              interest rates with quick approvals.
            </p>
          </div>
        )}

        {selectedMenu === "Investments" && (
          <div>
            <h2>Investments</h2>
            <p>
              Explore fixed deposits, recurring deposits, SIPs, and long-term
              investment options.
            </p>
          </div>
        )}

        {selectedMenu === "Calculator" && (
          <div>
            <h2>Financial Calculators</h2>
            <Calculator />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
