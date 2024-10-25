/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { css } from '@emotion/react';
import { Row, Col, Button, Spinner, Alert, Card, Accordion } from 'react-bootstrap';
import { useTheme } from '@emotion/react';
import { setSelectedCharacter } from '../../redux/actions/characterActions';

const CharacterSummary = () => {
  const [characters, setCharacters] = useState([]);
  const [error, setError] = useState(null);
  const userId = useSelector((store) => store.user.id);
  const theme = useTheme();
  const history = useHistory();
  const dispatch = useDispatch();

  // Main container styling
  const containerStyle = css`
    background: ${theme.colors.offWhiteBackground};
    padding: ${theme.spacing.large};
    border-radius: 12px;
    max-width: 1200px;
    margin: 0 auto;
    margin-top: ${theme.spacing.large};
  `;

  const headingStyle = css`
    color: ${theme.colors.headingFooter};
    font-family: ${theme.fonts.heading};
    font-size: ${theme.typography.sizes.large};
    text-align: center;
    margin-bottom: ${theme.spacing.large};
  `;

  const characterCardStyle = css`
    background: ${theme.colors.baseColor2};
    color: ${theme.colors.offWhiteBackground};
    border-radius: 10px;
    padding: ${theme.spacing.medium};
    box-shadow: 0px 3px 6px ${theme.colors.boxShadow};
    transition: transform 0.3s;
    margin-bottom: ${theme.spacing.large};
    &:hover {
      transform: translateY(-5px);
    }
  `;

  const buttonStyle = css`
    margin-top: ${theme.spacing.medium};
    background-color: ${theme.colors.contrast};
    border: none;
    padding: 8px 16px;
    &:hover {
      background-color: ${theme.colors.trim};
    }
  `;

  // Accordion styling for theme consistency
  const accordionStyle = css`
    .accordion-button {
      background-color: ${theme.colors.baseColor};
      color: ${theme.colors.offWhiteBackground};
      font-weight: ${theme.typography.weights.bold};
      &:not(.collapsed) {
        background-color: ${theme.colors.baseColor2};
      }
    }
    .accordion-body {
      background-color: ${theme.colors.secondaryBackground};
      color: ${theme.colors.trim};
      padding: ${theme.spacing.medium};
      border-radius: 8px;
    }
  `;

  useEffect(() => {
    const fetchCharacterData = async (retries = 3) => {
      try {
        const response = await fetch(`/api/characters/user/${userId}`);
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${await response.text()}`);
        }
        setCharacters(await response.json());
      } catch (error) {
        if (retries > 0) {
          console.log("Retrying fetch in 1 second...");
          setTimeout(() => fetchCharacterData(retries - 1), 1000); 
        } else {
          console.error("Error fetching character data:", error.message);
          setError(error.message);
        }
      }
    };
  
    if (userId) {
      fetchCharacterData(); 
    }
  }, [userId]);

  const handleDelete = async (characterId) => {
    if (!window.confirm("Are you sure you want to delete this character?")) return;
    try {
      const response = await fetch(`/api/characters/${characterId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setCharacters((prev) => prev.filter((char) => char.character_id !== characterId));
      } else {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error("Error deleting character:", error.message);
      setError(error.message);
    }
  };

  const handleViewCharacter = (characterId) => {
    dispatch(setSelectedCharacter(characterId));
    history.push(`/character-sheet/${characterId}`);
  };

  const renderCharacterSummary = (character) => (
    <Accordion css={accordionStyle}>
      <Accordion.Item eventKey="0">
        <Accordion.Header>Health & Stats</Accordion.Header>
        <Accordion.Body>
          <p><strong>Max HP:</strong> {character.max_hp || 'N/A'}</p>
          <p><strong>Current HP:</strong> {character.current_hp || 'N/A'}</p>
          <p><strong>Focus Points:</strong> {character.focus_points || 'N/A'}</p>
          <p><strong>Soul Rank:</strong> {character.soul_rank}</p>
          <p><strong>Speed Class:</strong> {character.speed_class}</p>
        </Accordion.Body>
      </Accordion.Item>
      {/* Additional accordion items for Major, Minor stats, etc., as previously defined */}
    </Accordion>
  );

  if (error) {
    return (
      <div css={containerStyle}>
        <Alert variant="danger" css={css`text-align: center;`}>Error: {error}</Alert>
      </div>
    );
  }

  if (!characters.length) {
    return (
      <div css={containerStyle}>
        <Spinner animation="border" variant="primary" /> Loading...
      </div>
    );
  }

  return (
    <div css={containerStyle}>
      <h1 css={headingStyle}>Character Summary</h1>
      {characters.map((character) => (
        <Card key={character.character_id} css={characterCardStyle}>
          <Card.Body>
            <Card.Title>{character.character_name}</Card.Title>
            <Card.Text><strong>Race:</strong> {character.race}</Card.Text>
            <Card.Text><strong>Vocation:</strong> {character.vocation}</Card.Text>
            <Card.Text><strong>Specialty:</strong> {character.specialty || 'N/A'}</Card.Text>

            {renderCharacterSummary(character)}

            <Button variant="primary" css={buttonStyle} onClick={() => handleViewCharacter(character.character_id)}>
              View Character Sheet
            </Button>
            <Button variant="danger" css={buttonStyle} onClick={() => handleDelete(character.character_id)}>
              Delete Character
            </Button>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default CharacterSummary;
