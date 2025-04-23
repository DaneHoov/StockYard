import { useSelector, useDispatch } from "react-redux";
import { thunkRemoveFromWatchlist } from "../../redux/session";
import "./Watchlist.css";

function Watchlist() {
  const dispatch = useDispatch();
  const watchlist = useSelector((state) => state.session.watchlist);
  const sessionUser = useSelector((state) => state.session.user);

  const handleRemoveFromWatchlist = (stockSymbol) => {
    dispatch(thunkRemoveFromWatchlist(stockSymbol));
  };

  if (!sessionUser) {
    return <p>Please log in to view your watchlist.</p>;
  }

  if (watchlist.length === 0) {
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
          {watchlist.map((stock) => (
            <tr key={stock.symbol}>
              <td>{stock.symbol}</td>
              <td>${stock.price.toFixed(2)}</td>
              <td>{stock.change}</td>
              <td>
                <button
                  onClick={() => handleRemoveFromWatchlist(stock.symbol)}
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
