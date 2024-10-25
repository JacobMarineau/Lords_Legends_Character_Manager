/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import { theme } from '../../theme/theme';

function Footer() {
  // Footer container styling
  const footerStyle = css`
    background-color: ${theme.colors.baseColor2};
    color: ${theme.colors.offWhiteBackground};
    text-align: center;
    padding: ${theme.spacing.medium} 0;
    width: 100%;
    bottom: 0;
    box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.1);
    font-family: ${theme.fonts.body};
    font-size: ${theme.typography.sizes.small};
    margin-top: 20px;
  `;

  return (
    <footer css={footerStyle}>
      &copy; {new Date().getFullYear()} Lords and Legends | Prime Digital Academy
    </footer>
  );
}

export default Footer;

