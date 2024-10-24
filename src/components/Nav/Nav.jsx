/** @jsxImportSource @emotion/react */
import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { css } from '@emotion/react';
import LogOutButton from '../LogOutButton/LogOutButton';
import { theme } from '../../theme/theme'; 

function Nav({ characterId }) {
  const user = useSelector((store) => store.user);
  const userId = useSelector((store) => store.user.id);

  // Primary Nav Styling
  const primaryNavStyle = css`
    background-color: ${theme.colors.baseColor};
    padding: ${theme.spacing.medium};
    display: flex;
    align-items: center;
    justify-content: flex-start;
    box-shadow: 0px 4px 10px ${theme.colors.boxShadow};
    position: relative;
    z-index: 10;
  `;

  // Secondary Nav Styling
  const secondaryNavStyle = css`
    background-color: ${theme.colors.baseColor2};
    padding: ${theme.spacing.small};
    display: flex;
    justify-content: space-around;
    margin-top: ${theme.spacing.small};
  `;

  // Link Styling for Primary Nav
  const linkStylePrimary = css`
    color: ${theme.colors.offWhiteBackground2};
    margin-right: ${theme.spacing.medium};
    font-size: ${theme.typography.sizes.large};
    font-family: ${theme.fonts.heading};
    padding: 4px;
    border-radius: 4px;
    text-decoration: none;
    &:hover {
      color: ${theme.colors.accents};
    }
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5); /* Drop shadow */
  `;

  // Link Styling for Secondary Nav
  const linkStyleSecondary = css`
    color: ${theme.colors.offWhiteBackground};
    text-decoration: none;
    font-size: ${theme.typography.sizes.normal};
    &:hover {
      color: ${theme.colors.trim};
    }
  `;

  return (
    <>
      {/* Primary Nav */}
      <div css={primaryNavStyle}>
        {/* Space for logo */}
        <h2 className="nav-title" css={linkStylePrimary}>Prime Solo Project</h2>

        {user.id && (
          <>
            <Link css={linkStylePrimary} to="/home">
              Home
            </Link>
            <LogOutButton css={linkStylePrimary} />
          </>
        )}
      </div>

      {/* Secondary Nav */}
      {user.id && (
        <div css={secondaryNavStyle}>
          <Link css={linkStyleSecondary} to="/characterstats1">Character Creator</Link>
          <Link css={linkStyleSecondary} to="/characterstats2">Character Creator Part 2</Link>
          <Link css={linkStyleSecondary} to="/characterstats3">Character Creator Part 3</Link>
          <Link css={linkStyleSecondary} to={`/character-summary/${userId}`}>Characters</Link>
          <Link css={linkStyleSecondary} to={`/character-sheet/${characterId}`}>Char Sheet</Link>
        </div>
      )}
    </>
  );
}

export default Nav;
