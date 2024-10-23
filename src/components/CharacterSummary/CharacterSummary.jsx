/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { css } from '@emotion/react';
import { Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { useTheme } from '@emotion/react';

const CharacterSummary = () => {
  const [characters, setCharacters] = useState([]);
  const [error, setError] = useState(null);
  const userId = useSelector((store) => store.user.id);
  const theme = useTheme();

  // Container for the whole page
  const containerStyle = css`
    background: ${theme.colors.offWhiteBackground};
    padding: ${theme.spacing.large};
    border-radius: 12px;
    box-shadow: 0px 4px 10px ${theme.colors.boxShadow};
    max-width: 1200px;
    margin: 0 auto;
  `;

  // Header style
  const headingStyle = css`
    color: ${theme.colors.headingFooter};
    font-family: ${theme.fonts.heading};
    font-size: ${theme.typography.sizes.large};
    margin-bottom: ${theme.spacing.large};
    text-align: center;
  `;

  // Each character card style
  const characterCardStyle = css`
    background: ${theme.colors.baseColor2};
    padding: ${theme.spacing.large};
    margin-bottom: ${theme.spacing.large};
    border-radius: 10px;
    color: ${theme.colors.offWhiteBackground};
    box-shadow: 0px 3px 6px ${theme.colors.boxShadow};
    transition: transform 0.3s;
    &:hover {
      transform: translateY(-5px);
    }
  `;

  // Style for each key-value pair
  const detailItemStyle = css`
    margin-bottom: ${theme.spacing.small};
    line-height: 1.6;
  `;

  // Button style
  const buttonStyle = css`
    margin-top: ${theme.spacing.medium};
    background-color: ${theme.colors.contrast};
    border: none;
    padding: 8px 16px;
    font-size: ${theme.typography.sizes.normal};
    &:hover {
      background-color: ${theme.colors.trim};
    }
  `;

  // Label style
  const labelStyle = css`
    font-weight: ${theme.typography.weights.bold};
    color: ${theme.colors.trim};
  `;

  // Error style
  const errorStyle = css`
    text-align: center;
    margin-top: ${theme.spacing.large};
  `;

  useEffect(() => {
    const fetchCharacterData = async () => {
      try {
        const response = await fetch(`/api/characters/user/${userId}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error ${response.status}: ${errorText}`);
        }
        const data = await response.json();
        setCharacters(data);
      } catch (error) {
        console.error("Error fetching character data:", error.message);
        setError(error.message);
      }
    };

    fetchCharacterData();
  }, [userId]);

  const handleDelete = async (characterId) => {
    if (!window.confirm("Are you sure you want to delete this character?")) {
      return;
    }

    try {
      const response = await fetch(`/api/characters/${characterId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Character deleted successfully.");
        setCharacters((prevCharacters) =>
          prevCharacters.filter((character) => character.character_id !== characterId)
        );
      } else {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error("Error deleting character:", error.message);
      setError(error.message);
    }
  };

  const renderCharacterDetails = (character) => {
    return Object.entries(character).map(([key, value]) => {
      if (Array.isArray(value)) {
        return (
          <div key={key} css={detailItemStyle}>
            <span css={labelStyle}>{key}</span>:
            <ul>
              {value.map((item, index) => (
                <li key={index}>{JSON.stringify(item)}</li>
              ))}
            </ul>
          </div>
        );
      } else if (typeof value === 'object' && value !== null) {
        return (
          <div key={key} css={detailItemStyle}>
            <span css={labelStyle}>{key}</span>: {renderCharacterDetails(value)}
          </div>
        );
      } else {
        return (
          <div key={key} css={detailItemStyle}>
            <span css={labelStyle}>{key}</span>: {value !== null ? value : 'N/A'}
          </div>
        );
      }
    });
  };

  if (error) {
    return (
      <div css={errorStyle}>
        <Alert variant="danger">Error: {error}</Alert>
      </div>
    );
  }

  if (!characters.length) {
    return (
      <div css={errorStyle}>
        <Spinner animation="border" variant="primary" /> Loading...
      </div>
    );
  }

  return (
    <div css={containerStyle}>
      <h1 css={headingStyle}>Character Summary</h1>
      {characters.map((character) => (
        <div key={character.character_id} css={characterCardStyle}>
          <Row>
            <Col>{renderCharacterDetails(character)}</Col>
            <Col className="text-end">
              <Button
                variant="danger"
                css={buttonStyle}
                onClick={() => handleDelete(character.character_id)}
              >
                Delete Character
              </Button>
            </Col>
          </Row>
        </div>
      ))}
    </div>
  );
};

export default CharacterSummary;
