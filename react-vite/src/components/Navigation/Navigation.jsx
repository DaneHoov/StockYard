import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import ProfileButton from './ProfileButton';
import './Navigation.css';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector((state) => state.session.user);
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchParam = queryParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setSearchQuery(searchParam);
  }, [searchParam]);


  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/signup';
  const isTradePage = location.pathname === '/trade';

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/trade?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="nav-left">
          <NavLink to="/" className="home-logo">
            <i
              className="fa-solid fa-piggy-bank"
              style={{ fontSize: '24px', color: '#91c274', marginLeft: '10px' }}
            ></i>
          </NavLink>
          <NavLink to="/" className="title">
            StockYard
          </NavLink>
        </div>
        {!isAuthPage && (
          <div className="nav-right">
            {isTradePage && (
              <form className="search-bar" onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search stocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">
                  <i className="fa fa-search"></i>
                </button>
              </form>
            )}

            {sessionUser ? (
              <>
                <div className="nav-link">
                  <NavLink to="/trade" className="create-link ">
                    Trade
                  </NavLink>
                </div>
                <div className="nav-link">
                  <NavLink to="/watchlist" className="create-link ">
                    Watchlist
                  </NavLink>
                </div>
                <div className="nav-link">
                  <NavLink to="/portfolio" className="create-link ">
                    Portfolio
                  </NavLink>
                </div>
                <div className="profile-btn-wrapper">
                  {isLoaded && sessionUser && (
                    <ProfileButton user={sessionUser} />
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="nav-link">
                  <NavLink to="/login" className="auth-link">
                    Log In
                  </NavLink>
                </div>
                <div className="nav-link">
                  <NavLink to="/signup" className="auth-link">
                    Sign Up
                  </NavLink>
                </div>
              </>
            )}
          </div>
        )}
      </nav>
    </div>
  );
}

export default Navigation;
