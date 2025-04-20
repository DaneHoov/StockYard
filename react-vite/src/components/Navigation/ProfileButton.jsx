import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { FaUserCircle } from "react-icons/fa";
import { HiBars3 } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import * as sessionActions from "../../redux/session";
import "./ProfileButton.css";

function ProfileButton({ user }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const ulRef = useRef();

  const toggleMenu = (e) => {
    e.stopPropagation(); // Prevent bubbling up to document
    setShowMenu(!showMenu);
  };

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      if (!ulRef.current || !ulRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("click", closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.thunkLogout());
    setShowMenu(false);
    navigate("/"); // Redirect to home page after logout
  };

  const ulClassName = `profile-dropdown${showMenu ? "" : " hidden"}`;

  return (
    <>
      <button onClick={toggleMenu} className="profile-button">
        <div className="menu">
          <HiBars3 size={30} />
        </div>
        <div className="user">
          <FaUserCircle size={30} />
        </div>
      </button>

      <ul className={ulClassName} ref={ulRef}>
        {user ? (
          <>
            <div className="options">
              <div>Hello, {user.username}</div>
              <div>{user.email}</div>
            </div>
            <hr />
            <div className="logout-button-div">
              <button className="logout-button" onClick={logout}>
                Log Out
              </button>
            </div>
          </>
        ) : (
          <>
            <li>
              <button onClick={() => navigate("/login")}>Log In</button>
            </li>
            <li>
              <button onClick={() => navigate("/signup")}>Sign Up</button>
            </li>
          </>
        )}
      </ul>
    </>
  );
}

export default ProfileButton;
