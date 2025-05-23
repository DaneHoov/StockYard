import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWatchlist } from "../../redux/session";
import { fetchStocks } from "../../redux/stocks";
// import { addStockToPortfolioThunk } from "../../redux/portfolio";

import {
  thunkAddToWatchlist,
  thunkRemoveFromWatchlist,
  thunkAddToPortfolio,
  thunkRemoveFromPortfolio,
  thunkFetchWatchlists,
} from "../../redux/session";
import "./Trade.css";

function Trade() {
  const dispatch = useDispatch();
  const stocks = useSelector((state) => state.stocks);
  const watchlists = useSelector((state) => state.session.watchlists);
  const sessionUser = useSelector((state) => state.session.user);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedSide, setSelectedSide] = useState("Buy");
  const [quantity, setQuantity] = useState(10);
  const [stopPriceType, setStopPriceType] = useState("Dollars");
  const [stopPrice, setStopPrice] = useState(-1);
  const [limitPrice, setLimitPrice] = useState(1);
  const [isWatchlistModalOpen, setIsWatchlistModalOpen] = useState(false);
  const [selectedWatchlist, setSelectedWatchlist] = useState("");
  const [stockToAdd, setStockToAdd] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (sessionUser) {
      dispatch(thunkFetchWatchlists());
      dispatch(fetchWatchlist());

      if (!searchQuery) {
        dispatch(fetchStocks());
      } else {
        fetch(`/api/stocks/search?q=${encodeURIComponent(searchQuery)}`)
          .then((res) => res.json())
          .then((data) => setSearchResults(data))
          .catch((err) => console.error("Failed to fetch search results:", err));
      }
    }
  }, [dispatch, sessionUser, searchQuery]);
  //NEW: Set default selectedStock
  useEffect(() => {
    if (!selectedStock && stocks.length > 0) {
      setSelectedStock(stocks[0]);
    }
  }, [stocks, selectedStock]);

  // new
  const openWatchlistModal = (stock) => {
    setStockToAdd(stock);
    setSelectedWatchlist("");
    setIsWatchlistModalOpen(true);
  };

  // new
  const closeWatchlistModal = () => {
    setIsWatchlistModalOpen(false);
    setStockToAdd(null);
  };

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

  // const handleAddToWatchlist = async (stock) => {
  //   try {
  //     await dispatch(thunkAddToWatchlist(stock));
  //     alert(`${stock.ticker} has been added to your watchlist.`);
  //   } catch (error) {
  //     console.error("Failed to add to watchlist:", error);
  //     alert("Failed to add to watchlist. Please try again.");
  //   }
  // };
  // new
  const handleAddStockToWatchlist = async () => {
    if (!selectedWatchlist) {
      alert("Please select a watchlist.");
      return;
    }

    try {
      console.log("stockToAdd:", stockToAdd);
      console.log("selectedWatchlist:", selectedWatchlist);
      await dispatch(
        thunkAddToWatchlist({
          stockId: stockToAdd.id,
          watchlistId: selectedWatchlist,
        })
      );
      alert(`${stockToAdd.ticker} has been added to the selected watchlist.`);
      closeWatchlistModal();
    } catch (error) {
      console.error("Failed to add to watchlist:", error);
      alert("Failed to add to watchlist. Please try again.");
    }
  };

  const handleRemoveFromWatchlist = async (stock, watchlistId) => {
    try {
      await dispatch(thunkRemoveFromWatchlist(stock.ticker, watchlistId));
      alert(`${stock.ticker} has been removed from your watchlist.`);
    } catch (error) {
      alert("Failed to remove from watchlist. Please try again.");
    }
  };
  // const handleRemoveFromWatchlist = async (stock) => {
  //   const match = watchlists.find((item) => item.ticker === stock.ticker);
  //   if (!match || !match.id) {
  //     console.error("Stock ID is missing for removal:", stock);
  //     alert("Failed to remove from watchlist: Missing stock ID.");
  //     return;
  //   }

  //   try {
  //     console.log("Removing stock:", stock); // Debugging log
  //     await dispatch(thunkRemoveFromWatchlist(match.id));
  //     alert(`${stock.ticker} has been removed from your watchlist.`);
  //   } catch (error) {
  //     console.error("Failed to remove from watchlist:", error);
  //     alert("Failed to remove from watchlist. Please try again.");
  //   }
  // };

  const isStockInWatchlist = (stockSymbol) => {
    for (const wl of watchlists) {
      const result = wl.stocks?.find((stock) => stock.ticker === stockSymbol);
      if (result) {
        console.log(`Checking if ${stockSymbol} is in any watchlist:`, result);
        return result;
      }
    }
    return null;
  };


  // const handleAddToPortfolio = async (stock) => {
  //   try {
  //     const quantity = prompt(`Enter the quantity of ${stock.ticker} to add:`);
  //     if (!quantity || isNaN(quantity) || quantity <= 0) {
  //       alert("Invalid quantity. Please enter a positive number.");
  //       return;
  //     }

  //     // Fetch the stock ID if it's missing
  //     if (!stock.id) {
  //       const response = await fetch(`/api/stocks/${stock.ticker}`);
  //       if (response.ok) {
  //         const data = await response.json();
  //         stock.id = data.id; // Add the fetched ID to the stock object
  //       } else {
  //         alert("Failed to fetch stock ID. Cannot add to portfolio.");
  //         console.error("Failed to fetch stock ID for:", stock);
  //         return;
  //       }
  //     }

  //     await dispatch(
  //       thunkAddToPortfolio({ ...stock, quantity: parseInt(quantity) })
  //     );
  //     // alert(`${quantity} shares of ${stock.ticker} have been added to your portfolio.`);
  //   } catch (error) {
  //     console.error("Failed to add to portfolio:", error);
  //     alert("Failed to add to portfolio. Please try again.");
  //   }
  // };

  const handleSellStock = async (stock) => {
    try {
      console.log("sessionUser:", sessionUser); // Debugging log
      const portfolioId = sessionUser?.portfolios?.[0]?.id;
      console.log("portfolioId:", portfolioId); // Debugging log

      if (!portfolioId) {
        alert("Portfolio ID is missing. Please try again.");
        return;
      }

      if (!quantity || isNaN(quantity) || quantity <= 0) {
        alert("Invalid quantity. Please enter a positive number.");
        return;
      }


      await dispatch(
        thunkRemoveFromPortfolio({
          ticker: stock.ticker,
          quantity: parseInt(quantity),
          portfolioId,
        })
      );
      alert(`${quantity} shares of ${stock.ticker} have been sold.`);
    } catch (error) {
      console.error("Failed to sell stock:", error);
      alert("Failed to sell stock. Please try again.");
    }
  };

  const handleBuyStock = async (stock, quantity) => {
    if (!stock) {
      alert("Please select a stock to buy.");
      return;
    }

    if (!quantity || isNaN(quantity) || quantity <= 0) {
      alert("Invalid quantity. Please enter a positive number.");
      return;
    }

    try {
      await dispatch(thunkAddToPortfolio({ ...stock, quantity }));
      alert(`${quantity} shares of ${stock.ticker} have been purchased.`);
    } catch (error) {
      console.error("Failed to buy stock:", error);
      alert("Failed to buy stock. Please try again.");
    }
  };

  return (
    <div className="trade-page">
      <div className="trade-container">
        <h1>Trade Stocks</h1>
        <input
          type="text"
          placeholder="Search stocks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {sessionUser ? (
          <table className="trade-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>% Change</th>
                <th>Features</th>
                <th>% Change</th>
                <th>Open</th>
                <th>Prev Close</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            {(searchQuery ? searchResults : stocks).map((stock) => (
                <tr
                  key={stock.ticker}
                  onClick={() => setSelectedStock(stock)}
                  className={
                    selectedStock?.ticker === stock.ticker ? "active-row" : ""
                  }
                >
                  <td>{stock.ticker}</td>
                  <td>${stock.price.toFixed(2)}</td>
                  <td>{stock.change}</td>
                  <td>
                    {isStockInWatchlist(stock.ticker) ? (
                      <button
                        className="remove-from-watchlist"
                        onClick={() => handleRemoveFromWatchlist(stock)}
                      >
                        Remove from Watchlist
                      </button>
                    ) : (
                      <button
                        className="add-to-watchlist"
                        onClick={() => openWatchlistModal(stock)}
                      >
                        Add to Watchlist
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Please log in to view and trade stocks.</p>
        )}
      </div>

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
                    selectedSide === "Buy" ? "active buy" : ""
                  }`}
                  onClick={() => setSelectedSide("Buy")}
                >
                  Buy
                </div>
                <div
                  className={`side-option ${
                    selectedSide === "Sell" ? "active sell" : ""
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
                      adjustStopPrice(stopPriceType === "Dollars" ? -0.01 : -1)
                    }
                  >
                    ▼
                  </button>
                  <span>
                    {stopPriceType === "Percentages" && formatPrice(stopPrice)}
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
                      adjustLimitPrice(stopPriceType === "Dollars" ? -0.01 : -1)
                    }
                  >
                    ▼
                  </button>
                  <span>
                    {stopPriceType === "Percentages" && formatPrice(limitPrice)}
                  </span>
                </div>
                <button
                  className={`trade-button ${
                    selectedSide === "Buy" ? "buy" : "sell"
                  }`}
                  onClick={() =>
                    selectedSide === "Buy"
                      ? handleBuyStock(selectedStock, quantity)
                      : handleSellStock(selectedStock)
                  }
                >
                  {selectedSide}{" "}
                  {selectedStock.ticker && `(${selectedStock.ticker})`}
                </button>
              </div>
              <button onClick={toggleStopPriceType}>{stopPriceType}</button>
            </div>
          </div>
        )}
      </div>

      {/* // new */}
      {isWatchlistModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add {stockToAdd?.ticker} to Watchlist</h2>
            <select
              value={selectedWatchlist}
              onChange={(e) => setSelectedWatchlist(e.target.value)}
            >
              <option value="">Select a watchlist</option>
              {watchlists.map((watchlistItem) => (
                <option key={watchlistItem.id} value={watchlistItem.id}>
                  {watchlistItem.name}
                </option>
              ))}
            </select>
            <div className="modal-buttons">
              <button
                className="modal-add-button"
                onClick={handleAddStockToWatchlist}
                disabled={!selectedWatchlist}
              >
                Add to Watchlist
              </button>
              <button
                className="modal-cancel-button"
                onClick={closeWatchlistModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default Trade;
