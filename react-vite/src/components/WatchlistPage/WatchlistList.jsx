import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  thunkCreateWatchlist,
  thunkDeleteWatchlist,
  thunkFetchWatchlists,
} from "../../redux/session";
import { useNavigate } from "react-router-dom";
import "./WatchlistList.css";

function WatchlistList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const watchlists = useSelector((state) => state.session.watchlists);
  const [showModal, setShowModal] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState("");
  const sessionUser = useSelector((state) => state.session.user);

  useEffect(() => {
    if (!sessionUser) {
      navigate("/login");
    }
  }, [sessionUser, navigate]);

  useEffect(() => {
    if (sessionUser) {
      dispatch(thunkFetchWatchlists());
    }
  }, [dispatch, sessionUser]);

  const handleCreateWatchlist = async () => {
    if (!newWatchlistName.trim()) {
      alert("Please enter a valid name.");
      return;
    }
    await dispatch(thunkCreateWatchlist(newWatchlistName));
    setShowModal(false);
    setNewWatchlistName("");
  };

  const handleDeleteWatchlist = async (watchlistId) => {
    if (window.confirm("Are you sure you want to delete this watchlist?")) {
      await dispatch(thunkDeleteWatchlist(watchlistId));
    }
  };

  return (
    <div className="watchlist-list-container">
      <h1 style={{ marginBottom: "20px" }}>Your Watchlists</h1>
      {watchlists.length === 0 && (
        <p style={{ marginBottom: "20px" }}>
          No watchlists found. Create one to get started!
        </p>
      )}
      <button
        onClick={() => setShowModal(true)}
        className="create-watchlist-button"
        style={{ marginBottom: "20px" }}
      >
        Create Watchlist
      </button>
      <ul className="watchlist-list">
        {watchlists.length > 0 &&
          watchlists.map((watchlist) => (
            <li key={watchlist.id} className="watchlist-item">
              <span onClick={() => navigate(`/watchlist/${watchlist.id}`)}>
                {watchlist.name}
              </span>
              <button
                onClick={() => handleDeleteWatchlist(watchlist.id)}
                className="delete-watchlist-button"
              >
                Delete
              </button>
            </li>
          ))}
      </ul>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Create Watchlist</h2>
            <input
              type="text"
              value={newWatchlistName}
              onChange={(e) => setNewWatchlistName(e.target.value)}
              placeholder="Enter watchlist name"
            />
            <button
              onClick={handleCreateWatchlist}
              className="modal-create-button"
            >
              Create
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="modal-cancel-button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WatchlistList;
