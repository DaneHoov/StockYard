import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getPortfolioThunk,createPortfolioThunk,updatePortfolioThunk,deletePortfolioThunk,} from '../../redux/portfolio';
import './Portfolio.css';

function Portfolio() {
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const portfolioState = useSelector((state) => state.portfolio);
  const portfolio = sessionUser ? portfolioState[sessionUser.id] : null;

  const [tab, setTab] = useState('funds');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (sessionUser) {
      dispatch(getPortfolioThunk(sessionUser.id));
    }
  }, [dispatch, sessionUser]);

  const handleCreate = () => {
    dispatch(createPortfolioThunk({ user_id: sessionUser.id, balance: 0 }));
  };

  const handleAddFunds = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount)) return;
    dispatch(updatePortfolioThunk(sessionUser.id, { amount: parseFloat(amount) }));
    setAmount('');
  };

  const handleDelete = () => {
    dispatch(deletePortfolioThunk(sessionUser.id));
  };


  if (!sessionUser) {
    return <p>Please log in to view your portfolio.</p>;
  }

  if (!portfolio) {
    return (
      <div className="no-portfolio">
        <p>You don’t have a portfolio yet.</p>
        <button onClick={handleCreate}>Create Portfolio</button>
      </div>
    );
  }

  return (
    <div className="portfolio-container">
      <h1>{sessionUser.username}'s Portfolio</h1>

      <div className="portfolio-tabs">
        <button
          className={tab === 'funds' ? 'active-tab' : ''}
          onClick={() => setTab('funds')}
        >
          Funds
        </button>
        <button
          className={tab === 'stocks' ? 'active-tab' : ''}
          onClick={() => setTab('stocks')}
        >
          Stocks
        </button>
      </div>

      {tab === 'funds' && (
        <div className="funds-tab">
          <h2>Available Cash: ${portfolio.balance ? portfolio.balance.toFixed(2) : '0.00'}</h2>
          <form onSubmit={handleAddFunds}>
            <input
              type="number"
              step="0.01"
              placeholder="Add funds..."
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button type="submit">Add Funds</button>
          </form>
          <button className="delete-btn" onClick={handleDelete}>
            Delete Portfolio
          </button>
        </div>
      )}

      {tab === 'stocks' && (
        <div className="stocks-tab">
          <h2>Stock Holdings</h2>
          <table className="stocks-table">
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
            {portfolio.portfolio_stocks.length > 0 ? (
            portfolio.portfolio_stocks.map((holding) => (
            <tr key={holding.id}>
        <td>{holding.stock.symbol}</td>
        <td>{holding.stock.name}</td>
        <td>{holding.quantity}</td>
         <td>${holding.stock.price.toFixed(2)}</td>
       <td>${(holding.stock.price * holding.quantity).toFixed(2)}</td>
      </tr>
  ))
) : (
  <tr>
    <td colSpan="5">No stocks in your portfolio yet.</td>
  </tr>
)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Portfolio;
