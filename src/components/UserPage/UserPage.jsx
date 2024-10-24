/** @jsxImportSource @emotion/react */
import React from 'react';
import { Link } from 'react-router-dom';
import { css } from '@emotion/react';
import { useSelector } from 'react-redux';
import { theme } from '../../theme/theme'; 
import { HashRouter as Router } from 'react-router-dom';


const UserPage = () => {
  const user = useSelector((store) => store.user);

  // Container styling for centering and layout
  const containerStyle = css`
    text-align: center;
    padding: ${theme.spacing.large};
    background-color: ${theme.colors.offWhiteBackground};
    min-height: 80vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  `;

  // Welcome message styling
  const welcomeStyle = css`
    font-size: ${theme.typography.sizes.xlarge};
    color: ${theme.colors.headingFooter};
    margin-bottom: ${theme.spacing.large};
  `;

  // Button styling for the main call-to-action buttons
  const buttonStyle = css`
    display: inline-block;
    padding: ${theme.spacing.medium} ${theme.spacing.large};
    margin: ${theme.spacing.medium};
    background-color: ${theme.colors.baseColor2};
    color: ${theme.colors.offWhiteBackground};
    text-decoration: none;
    font-size: ${theme.typography.sizes.large};
    font-family: ${theme.fonts.heading};
    border-radius: 8px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s ease, transform 0.2s ease;
    &:hover {
      background-color: ${theme.colors.trim};
      transform: translateY(-3px);
      cursor: pointer;
    }
  `;

  // Descriptions under the buttons
  const descriptionStyle = css`
    font-size: ${theme.typography.sizes.normal};
    color: ${theme.colors.baseColor};
    margin-bottom: ${theme.spacing.large};
  `;

  return (
    <Router>
    <div css={containerStyle}>
      {/* Welcome message */}
      <h1 css={welcomeStyle}>Welcome, {user.username}, to Lords and Legends!</h1>

      {/* Button to start Character Creator Part 1 */}
      <Link to="/characterstats1" css={buttonStyle}>
        Start Character Creator
      </Link>
      <p css={descriptionStyle}>
        Begin by creating your first character to embark on your adventure!
      </p>

      {/* Button to view Character List */}
      <Link to={`/character-summary/${user.id}`} css={buttonStyle}>
        View Your Characters
      </Link>
      <p css={descriptionStyle}>
        Once your characters are created, view and manage them here.
      </p>
    </div>
    </Router>
  );
};

export default UserPage;
