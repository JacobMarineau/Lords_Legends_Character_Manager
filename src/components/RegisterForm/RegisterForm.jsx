/** @jsxImportSource @emotion/react */
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { css } from '@emotion/react';
import { useTheme } from '@emotion/react';

function RegisterForm() {
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const errors = useSelector((store) => store.errors);
  const dispatch = useDispatch();

  const registerUser = (event) => {
    event.preventDefault();

    dispatch({
      type: 'REGISTER',
      payload: {
        username: username,
        password: password,
      },
    });
  };

  // Styling
  const formStyle = css`
  background-color: ${theme.colors.offWhiteBackground};
  padding: ${theme.spacing.large};
  border-radius: 12px;
  max-width: 400px;
  margin: ${theme.spacing.xxlarge} auto;
  box-shadow: 0px 4px 8px ${theme.colors.boxShadow};
  font-family: ${theme.fonts.main};
`;

const headingStyle = css`
  color: ${theme.colors.headingFooter};
  font-family: ${theme.fonts.heading};
  font-size: ${theme.typography.sizes.large};
  margin-bottom: ${theme.spacing.medium};
  text-align: center;
`;

const inputStyle = css`
  width: 100%;
  padding: ${theme.spacing.small};
  margin-top: ${theme.spacing.small};
  margin-bottom: ${theme.spacing.medium};
  border: 1px solid ${theme.colors.trim};
  border-radius: 4px;
`;

const buttonStyle = css`
  width: 100%;
  padding: ${theme.spacing.medium};
  background-color: ${theme.colors.baseColor2};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: ${theme.typography.sizes.normal};
  cursor: pointer;
  &:hover {
    background-color: ${theme.colors.trim};
  }
`;

const labelStyle = css`
  color: ${theme.colors.baseColor};
  font-weight: ${theme.typography.weights.bold};
`;

  return (
    <form css={formStyle} onSubmit={registerUser}>
      <h2 css={headingStyle}>Register User</h2>
      {errors.registrationMessage && (
        <h3 role="alert">
          {errors.registrationMessage}
        </h3>
      )}
      <div>
        <label css={labelStyle} htmlFor="username">
          Username:
          <input
            css={inputStyle}
            type="text"
            name="username"
            value={username}
            required
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>
      </div>
      <div>
        <label css={labelStyle} htmlFor="password">
          Password:
          <input
            css={inputStyle}
            type="password"
            name="password"
            value={password}
            required
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
      </div>
      <div>
        <input css={buttonStyle} type="submit" name="submit" value="Register" />
      </div>
    </form>
  );
}

export default RegisterForm;
