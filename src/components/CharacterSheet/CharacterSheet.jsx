import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // to get the character ID from the URL
import axios from 'axios';

const CharacterSheet = () => {
  const { id } = useParams(); 
  const [character, setCharacter] = useState(null); 
  const [editMode, setEditMode] = useState(false); 

  useEffect(() => {
    // Fetch character data on component load
    const fetchCharacter = async () => {
      try {
        const res = await axios.get(`/api/characters/${id}`);
        setCharacter(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCharacter();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCharacter((prevCharacter) => ({
      ...prevCharacter,
      [name]: value,
    }));
  };

  const saveChanges = async () => {
    try {
      await axios.put(`/api/characters/${id}`, character); // Send updated character data to backend
      alert('Character updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update character.');
    }
  };

  if (!character) return <div>Loading...</div>;

  return (
    <div className="container">
      <h1>Character Sheet: {character.name}</h1>

      {/* Display read-only info for immutable fields */}
      <div>
        <strong>Name:</strong> {character.name}
      </div>
      <div>
        <strong>Race:</strong> {character.race}
      </div>
      <div>
        <strong>Vocation:</strong> {character.vocation}
      </div>
      <div>
        <strong>Age:</strong> {character.age}
      </div>
      <div>
        <strong>Height:</strong> {character.height}
      </div>

      {/* Editable fields */}
      <div className="editable-fields">
        <label>Current HP</label>
        <input
          type="number"
          name="current_hp"
          value={character.current_hp}
          onChange={handleInputChange}
        />

        <label>Current Armor Rating</label>
        <input
          type="number"
          name="current_ar"
          value={character.current_ar}
          onChange={handleInputChange}
        />

        <label>Focus Points</label>
        <input
          type="number"
          name="focus_points"
          value={character.focus_points}
          onChange={handleInputChange}
        />

        <label>Soul Rank</label>
        <input
          type="number"
          name="soul_rank"
          value={character.soul_rank}
          onChange={handleInputChange}
        />

        <label>Glint Pieces</label>
        <input
          type="number"
          name="glint_pieces"
          value={character.glint_pieces}
          onChange={handleInputChange}
        />

        {/* Add more fields as needed */}
      </div>

      <button onClick={saveChanges}>Save Changes</button>
    </div>
  );
};

export default CharacterSheet;
