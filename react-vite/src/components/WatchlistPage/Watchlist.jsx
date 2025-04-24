import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  thunkRemoveFromWatchlist,
  thunkFetchWatchlist,
} from "../../redux/session";
import "./Watchlist.css";

function Watchlist() {
  const dispatch = useDispatch();
  const { watchlistId } = useParams();
  console.log("watchlistId:", watchlistId);
  const watchlist = useSelector((state) => state.session.watchlist);
  const sessionUser = useSelector((state) => state.session.user);

  useEffect(() => {
    if (watchlistId) {
      dispatch(thunkFetchWatchlist(watchlistId));
    }
  }, [dispatch, watchlistId]);

  const handleRemoveFromWatchlist = (stockTicker) => {
    dispatch(thunkRemoveFromWatchlist(stockTicker, watchlistId));
  };

  if (!sessionUser) {
    return <p>Please log in to view your watchlist.</p>;
  }

  if (!watchlist || !watchlist.stocks || watchlist.stocks.length === 0) {
    return (
      <div className="watchlist-container">
        <div className="watchlist-card">
          <h1>Your Watchlist</h1>
          <p>
            No stocks have been added yet. Add stocks from the trade page to get
            started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="watchlist-container">
      <h1>{sessionUser.username}&#39;s Watchlist</h1>
      <table className="watchlist-table">
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
          {watchlist.stocks &&
            watchlist.stocks.map((stock) => (
              <tr key={stock.ticker}>
                <td>{stock.ticker}</td>
                <td>{stock.name}</td>
                <td>${stock.price.toFixed(2)}</td>
                <td>{stock.change}</td>
                <td>{stock.percentChange}</td>
                <td>{stock.open}</td>
                <td>{stock.prevClose}</td>
                <td>
                  <button
                    onClick={() => handleRemoveFromWatchlist(stock.ticker)}
                    className="remove-button"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default Watchlist;
