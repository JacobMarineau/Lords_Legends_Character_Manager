/** @jsxImportSource @emotion/react */
import React from 'react';
import { useHistory } from 'react-router-dom';
import { css } from '@emotion/react';
import RegisterForm from '../RegisterForm/RegisterForm';
import { useTheme } from '@emotion/react';

function RegisterPage() {
  const theme = useTheme();
  const history = useHistory();

  const pageStyle = css`
    display: flex;
    flex-direction: column;
    align-items: center;
    background: ${theme.colors.offWhiteBackground};
    min-height: 100vh;
    padding: ${theme.spacing.xxlarge} ${theme.spacing.medium};
  `;

  const buttonLinkStyle = css`
    margin-top: ${theme.spacing.large};
    padding: ${theme.spacing.small} ${theme.spacing.medium};
    background-color: transparent;
    color: ${theme.colors.headingFooter};
    font-size: ${theme.typography.sizes.normal};
    font-family: ${theme.fonts.main};
    border: none;
    cursor: pointer;
    text-decoration: underline;

    &:hover {
      color: ${theme.colors.trim};
    }
  `;

  return (
    <div css={pageStyle}>
      <RegisterForm />

      <center>
        <button
          type="button"
          css={buttonLinkStyle}
          onClick={() => {
            history.push('/login');
          }}
        >
          Login
        </button>
      </center>
    </div>
  );
}

export default RegisterPage;
