/** @jsxImportSource @emotion/react */
import React from 'react';
import { useDispatch } from 'react-redux';
import { theme } from '../../theme/theme'; 
import { css } from '@emotion/react';
import { Link } from 'react-router-dom';

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

function LogOutButton(props) {
  const dispatch = useDispatch();
  return (
    <Link css={linkStylePrimary}
      className={props.className}
      onClick={() => dispatch({ type: 'LOGOUT' })}
    >
      Log Out
    </Link>
  );
}

export default LogOutButton;
