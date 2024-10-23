import React from 'react';
import { Link } from 'react-router-dom';
import LogOutButton from '../LogOutButton/LogOutButton';
import './Nav.css';
import { useSelector } from 'react-redux';

function Nav({ characterId }) {
  const user = useSelector((store) => store.user);
  const userId = useSelector((store) => store.user.id);

  return (
    <div className="nav">
      <Link to="/home">
        <h2 className="nav-title">Prime Solo Project</h2>
      </Link>
      <div>
        {!user.id && (
          <Link className="navLink" to="/login">
            Login / Register
          </Link>
        )}

        {user.id && (
          <>
            <Link className="navLink" to="/user">
              Home
            </Link>

            <Link className="navLink" to="/info">
              Info Page
            </Link>

            <LogOutButton className="navLink" />
          </>
        )}

        <Link className="navLink" to="/characterstats1">
          Character Creator
        </Link>

        <Link className="navLink" to="/characterstats2">
          Character Creator Part 2
        </Link>

        <Link className="navLink" to="/characterstats3">
          Character Creator Part 3
        </Link>

        <Link className="navLink" to={`/character-summary/${userId}`}>
          Characters
        </Link>

       
              <Link className="navLink" to={`/character-sheet/${characterId}`}>
                Char Sheet
              </Link>

      </div>
    </div>
  );
}

export default Nav;
