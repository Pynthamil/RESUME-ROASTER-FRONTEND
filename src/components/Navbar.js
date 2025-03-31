import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Img1 from '../assets/ponyo.png';
import Img2 from '../assets/noface.png';

const Navbar = ({ darkMode, toggleTheme }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/auth/status', {
        credentials: 'include'
      });
      const data = await response.json();
      setIsAuthenticated(data.isAuthenticated);
      setUser(data.user);
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const googleLogin = () => {
    window.open('http://localhost:5000/auth/google', '_self');
  };

  const logout = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/logout`, {
        credentials: 'include'
      });
      if (response.ok) {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  

  return (
    <header className="navbar">
      <div className='navbar-container'>
        <Link to="/" className="navbar-logo">
          <h1>Resume Roaster</h1>
        </Link>
        
        <div className="navbar-controls">
          {isAuthenticated ? (
            <>
              <span className="welcome-message">Welcome, {user?.username}</span>
              <button onClick={logout} className="navbar-button logout-button">
                Logout
              </button>
            </>
          ) : (
            <button onClick={googleLogin} className="navbar-button login-button">
              Sign in with Google
            </button>
          )}
          <button onClick={toggleTheme} className="theme-toggle">
            <img src={darkMode ? Img1 : Img2} style={{ width: "30px", height: "30px" }} alt="Theme Toggle" />
          </button>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
