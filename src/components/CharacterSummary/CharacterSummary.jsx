import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const CharacterSummary = () => {
  const [characters, setCharacters] = useState([]);
  const [error, setError] = useState(null);
  const userId = useSelector((store) => store.user.id);
  console.log(userId)

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

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!characters.length) {
    return <div>Loading...</div>;
  }

  const renderCharacterDetails = (character) => {
    return Object.entries(character).map(([key, value]) => {
      if (Array.isArray(value)) {
        return (
          <div key={key}>
            <strong>{key}</strong>:
            <ul>
              {value.map((item, index) => (
                <li key={index}>{JSON.stringify(item)}</li>
              ))}
            </ul>
          </div>
        );
      } else if (typeof value === 'object' && value !== null) {
        return (
          <div key={key}>
            <strong>{key}</strong>: {renderCharacterDetails(value)}
          </div>
        );
      } else {
        return (
          <div key={key}>
            <strong>{key}</strong>: {value !== null ? value : 'N/A'}
          </div>
        );
      }
    });
  };

  return (
    <div>
      <h1>Character Summary</h1>
      {characters.map((character) => (
        <div key={character.character_id}>
          {renderCharacterDetails(character)}
        </div>
      ))}
    </div>
  );
};

export default CharacterSummary;
