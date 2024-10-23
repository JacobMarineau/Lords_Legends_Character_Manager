import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const CharacterSheet = () => {
  const { characterId } = useParams(); // Get characterId from URL
  const [character, setCharacter] = useState(null);
  const [newWeapon, setNewWeapon] = useState({ weapon_name: '', damage_die: '', description: '' });
  const [updatedName, setUpdatedName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const res = await axios.get(`/api/characters/${characterId}`);
        setCharacter(res.data);
        setUpdatedName(res.data.character_name); // Initialize name for editing
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [characterId]);

  const handleNameChange = (e) => {
    setUpdatedName(e.target.value);
  };

  const saveName = async () => {
    try {
      await axios.put(`/api/characters/${characterId}`, { name: updatedName });
      alert('Character name updated successfully!');
    } catch (err) {
      alert('Failed to update character name.');
    }
  };

  const handleWeaponChange = (e) => {
    const { name, value } = e.target;
    setNewWeapon((prevWeapon) => ({
      ...prevWeapon,
      [name]: value,
    }));
  };

  const addWeapon = async () => {
    try {
      await axios.post(`/api/characters/${characterId}/weapons`, newWeapon);
      alert('Weapon added successfully!');
      setNewWeapon({ weapon_name: '', damage_die: '', description: '' }); // Clear form after submission
    } catch (err) {
      alert('Failed to add weapon.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{character.name}'s Character Sheet</h1>

      {/* Section to edit character name */}
      <div>
        <label>Character Name:</label>
        <input type="text" value={updatedName} onChange={handleNameChange} />
        <button onClick={saveName}>Save Name</button>
      </div>

      {/* Form to add a new weapon */}
      <div>
        <h2>Add a Weapon</h2>
        <label>Weapon Name:</label>
        <input
          type="text"
          name="weapon_name"
          value={newWeapon.weapon_name}
          onChange={handleWeaponChange}
        />
        <label>Damage Die:</label>
        <input
          type="text"
          name="damage_die"
          value={newWeapon.damage_die}
          onChange={handleWeaponChange}
        />
        <label>Description:</label>
        <input
          type="text"
          name="description"
          value={newWeapon.description}
          onChange={handleWeaponChange}
        />
        <button onClick={addWeapon}>Add Weapon</button>
      </div>
    </div>
  );
};

export default CharacterSheet;
