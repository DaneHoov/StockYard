import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getPortfolioThunk,
  updatePortfolioThunk,
  createPortfolioThunk,
  deletePortfolioThunk,
} from "../../redux/portfolio";
import "./Portfolio.css";

function Portfolio() {
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const portfolio = useSelector((state) =>
    state.portfolio[sessionUser?.id]
  );
  const [showFunds, setShowFunds] = useState(true);
  const [addAmount, setAddAmount] = useState("");


  useEffect(() => {
    if (sessionUser) {
      dispatch(getPortfolioThunk(sessionUser.id));
    }
  }, [dispatch, sessionUser]);

  const handleAddFunds = async () => {
    if (addAmount && !isNaN(addAmount)) {
      await dispatch(updatePortfolioThunk(sessionUser.id, { add_cash: parseFloat(addAmount) }));
      setAddAmount("");
    }
  };

  const handleDelete = async () => {
    if (sessionUser && window.confirm("Are you sure you want to delete your portfolio?")) {
      await dispatch(deletePortfolioThunk(sessionUser.id));
    }
  };

  const handleCreatePortfolio = () => {
    dispatch(createPortfolioThunk({ user_id: sessionUser.id, balance: 0 }));
  };

  if (!sessionUser) {
    return <p>Please log in to view your portfolio.</p>;
  }

  if (!portfolio || Object.keys(portfolio).length === 0) {
    return (
      <div className="portfolio-container">
        <div className="portfolio-card">
          <h1>Your Portfolio</h1>
          <p>No portfolio found. Create one to get started!</p>
          <button className="create-portfolio-btn" onClick={handleCreatePortfolio}>
            Create Portfolio
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="portfolio-container">
      <div className="portfolio-card">
        <h2 className="portfolio-title">{sessionUser.username}&apos;s Portfolio</h2>

        <div className="toggle-buttons">
          <button className={showFunds ? "active" : ""} onClick={() => setShowFunds(true)}>
            Funds
          </button>
          <button className={!showFunds ? "active" : ""} onClick={() => setShowFunds(false)}>
            Stocks
          </button>
        </div>

        {showFunds ? (
          <>
            <p className="portfolio-balance">
              Available Cash: ${portfolio.balance?.toFixed(2)}
            </p>
            <input
              type="number"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              placeholder="Add funds..."
              className="fund-input"
            />
            <button className="action-btn" onClick={handleAddFunds}>
              Add Funds
            </button>
            <br />
            <button className="delete-btn" onClick={handleDelete}>
              Delete Portfolio
            </button>
          </>
        ) : (
          <>
            <h3>Stock Holdings</h3>
            {portfolio.portfolio_stocks?.length > 0 ? (
              <table className="stock-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Company</th>
                    <th>Shares</th>
                    <th>Price</th>
                    <th>Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.portfolio_stocks?.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.stock.ticker}</td>
                      <td>{entry.stock.name}</td>
                      <td>{entry.quantity}</td>
                      <td>${entry.stock.price.toFixed(2)}</td>
                      <td>${(entry.stock.price * entry.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>You have no stock holdings.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Portfolio;
