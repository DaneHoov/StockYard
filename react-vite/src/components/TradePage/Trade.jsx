import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWatchlist } from "../../redux/session";
import { fetchStocks } from "../../redux/stocks";
import { addStockToPortfolioThunk } from "../../redux/portfolio";

import {
  thunkAddToWatchlist,
  thunkRemoveFromWatchlist,
  thunkRemoveFromPortfolio,
} from "../../redux/session";
import "./Trade.css";


function Trade() {
  const dispatch = useDispatch();
  const stocks = useSelector((state) => state.stocks);
  const watchlist = useSelector((state) => state.session.watchlist);
  const sessionUser = useSelector((state) => state.session.user);

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedSide, setSelectedSide] = useState("Buy");
  const [quantity, setQuantity] = useState(10);
  const [stopPriceType, setStopPriceType] = useState("Dollars");
  const [stopPrice, setStopPrice] = useState(-1);
  const [limitPrice, setLimitPrice] = useState(1);

  useEffect(() => {
    dispatch(fetchStocks());
    dispatch(fetchWatchlist());
  }, [dispatch]);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const toggleStopPriceType = () => {
    setStopPriceType((prevType) =>
      prevType === "Dollars" ? "Percentages" : "Dollars"
    );
  };

  const adjustStopPrice = (delta) => {
    setStopPrice((prev) =>
      stopPriceType === "Dollars" ? prev + delta : Math.max(prev + delta, -100)
    );
  };

  const adjustLimitPrice = (delta) => {
    setLimitPrice((prev) =>
      stopPriceType === "Dollars" ? prev + delta : Math.max(prev + delta, 0)
    );
  };

  const formatPrice = (value) => {
    if (!selectedStock) return "";
    if (stopPriceType === "Dollars") {
      return `$${(value * parseFloat(selectedStock.price)).toFixed(2)}`;
    }
    return `${value}% (${(
      parseFloat(selectedStock.price) *
      (1 + value / 100)
    ).toFixed(2)})`;
  };

  const handleAddToWatchlist = async (stock) => {
    try {
      await dispatch(thunkAddToWatchlist(stock));
      alert(`${stock.symbol} has been added to your watchlist.`);
    } catch (error) {
      console.error("Failed to add to watchlist:", error);
      alert("Failed to add to watchlist. Please try again.");
    }
  };

  const handleRemoveFromWatchlist = async (stock) => {
    const match = watchlist.find((item) => item.symbol === stock.symbol);
    if (!match || !match.id) {
      console.error("Stock ID is missing for removal:", stock);
      alert("Failed to remove from watchlist: Missing stock ID.");
      return;
    }

    try {
      console.log("Removing stock:", stock); // Debugging log
      await dispatch(thunkRemoveFromWatchlist(match.id));
      alert(`${stock.symbol} has been removed from your watchlist.`);
    } catch (error) {
      console.error("Failed to remove from watchlist:", error);
      alert("Failed to remove from watchlist. Please try again.");
    }
  };

  const isStockInWatchlist = (stockSymbol) => {
    const result = watchlist.find((stock) => stock.symbol === stockSymbol);
    console.log(`Checking if ${stockSymbol} is in watchlist:`, result);
    return result;
  };

  const handleAddToPortfolio = async (stock) => {
    try {
      const quantity = prompt(`Enter the quantity of ${stock.symbol} to add:`);
      if (!quantity || isNaN(quantity) || quantity <= 0) {
        alert("Invalid quantity. Please enter a positive number.");
        return;
      }


      await dispatch(
        addStockToPortfolioThunk(sessionUser.id, {
          stock_id: stock.id,
          quantity: parseInt(quantity),
        })
      );

      alert(`${quantity} shares of ${stock.symbol} have been added to your portfolio.`);
    } catch (error) {
      console.error("Failed to add to portfolio:", error);
      alert("Failed to add to portfolio. Please try again.");
    }
  };


  const handleSellStock = async (stock) => {
    try {
      const quantity = prompt(`Enter the quantity of ${stock.symbol} to sell:`);
      if (!quantity || isNaN(quantity) || quantity <= 0) {
        alert("Invalid quantity. Please enter a positive number.");
        return;
      }
      await dispatch(thunkRemoveFromPortfolio({ symbol: stock.symbol, quantity: parseInt(quantity) }));
      alert(`${quantity} shares of ${stock.symbol} have been sold.`);
    } catch (error) {
      console.error("Failed to sell stock:", error);
      alert("Failed to sell stock. Please try again.");
    }
  };

  return (
    <div className="trade-page">
      <div className="trade-container">
        <h1>Trade Stocks</h1>
        {sessionUser ? (
          <table className="trade-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Name</th>
                <th>Price</th>
                <th>Change</th>
                <th>% Change</th>
                <th>Open</th>
                <th>Prev Close</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => (
                <tr
                  key={stock.symbol}
                  onClick={() => setSelectedStock(stock)}
                  className={
                    selectedStock?.symbol === stock.symbol ? "active-row" : ""
                  }
                >
                  <td>{stock.symbol}</td>
                  <td>${stock.price.toFixed(2)}</td>
                  <td>{stock.change}</td>
                  <td>
                    {isStockInWatchlist(stock.symbol) ? (
                      <button className="remove-from-watchlist" onClick={() => handleRemoveFromWatchlist(stock)}
                      >
                        Remove from Watchlist
                      </button>
                    ) : (
                      <button className="add-to-watchlist" onClick={() => handleAddToWatchlist(stock)}>
                        Add to Watchlist
                      </button>
                    )}
                    <button className="add-to-portfolio" onClick={() => handleAddToPortfolio(stock)}>
                      Add to Portfolio
                    </button>
                    <button className="sell-button" onClick={() => handleSellStock(stock)}>Sell</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Please log in to view and trade stocks.</p>
        )}
      </div>

      {selectedStock && (
        <div
          className={`sidebar ${isSidebarExpanded ? "expanded" : "collapsed"}`}
        >
          <div className="toggle-button" onClick={toggleSidebar}>
            {isSidebarExpanded ? "→" : "←"}
          </div>
          {isSidebarExpanded && (
            <div className="sidebar-content">
              <div className="classic-trade-section">
                <h3>Classic Trade</h3>
                <div className="side-bar">
                  <div
                    className={`side-option ${
                      selectedSide === "Buy" ? "active" : ""
                    }`}
                    onClick={() => setSelectedSide("Buy")}
                  >
                    Buy
                  </div>
                  <div
                    className={`side-option ${
                      selectedSide === "Sell" ? "active" : ""
                    }`}
                    onClick={() => setSelectedSide("Sell")}
                  >
                    Sell
                  </div>
                </div>
                <div className="quantity-selector">
                  <label>Quantity:</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  >
                    <option value={10}>10</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={500}>500</option>
                  </select>
                </div>
                <div>
                  <label>
                    <input type="checkbox" />
                    Stop-Loss Order
                  </label>
                  <div className="stop-price">
                    <input
                      type="number"
                      value={stopPrice}
                      onChange={(e) => setStopPrice(Number(e.target.value))}
                      step={stopPriceType === "Dollars" ? 0.01 : 1}
                      min={stopPriceType === "Percentages" ? -100 : undefined}
                    />
                    <button
                      onClick={() =>
                        adjustStopPrice(stopPriceType === "Dollars" ? 0.01 : 1)
                      }
                    >
                      ▲
                    </button>
                    <button
                      onClick={() =>
                        adjustStopPrice(
                          stopPriceType === "Dollars" ? -0.01 : -1
                        )
                      }
                    >
                      ▼
                    </button>
                    <span>
                      {stopPriceType === "Percentages" &&
                        formatPrice(stopPrice)}
                    </span>
                  </div>
                  <br />
                  <label>
                    <input type="checkbox" />
                    Take-Profit Order
                  </label>
                  <div className="stop-price">
                    <input
                      type="number"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(Number(e.target.value))}
                      step={stopPriceType === "Dollars" ? 0.01 : 1}
                      min={stopPriceType === "Percentages" ? 0 : undefined}
                    />
                    <button
                      onClick={() =>
                        adjustLimitPrice(stopPriceType === "Dollars" ? 0.01 : 1)
                      }
                    >
                      ▲
                    </button>
                    <button
                      onClick={() =>
                        adjustLimitPrice(
                          stopPriceType === "Dollars" ? -0.01 : -1
                        )
                      }
                    >
                      ▼
                    </button>
                    <span>
                      {stopPriceType === "Percentages" &&
                        formatPrice(limitPrice)}
                    </span>
                  </div>
                  <button
                    className={`trade-button ${
                      selectedSide === "Buy" ? "buy" : "sell"
                    }`}
                  >
                    {selectedSide} ({selectedStock.symbol})
                  </button>
                </div>
                <button onClick={toggleStopPriceType}>{stopPriceType}</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Trade;
