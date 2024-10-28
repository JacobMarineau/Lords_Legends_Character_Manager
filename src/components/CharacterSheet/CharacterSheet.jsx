/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { css } from '@emotion/react';
import { Form, Button, Card, Spinner, Alert, Row, Col, Accordion } from 'react-bootstrap';
import { useTheme } from '@emotion/react';

const CharacterSheet = () => {
  const theme = useTheme();
  const { characterId } = useParams();
  const [character, setCharacter] = useState(null);
  const [viewMode, setViewMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [characterUpdates, setCharacterUpdates] = useState({});
  const [newWeapon, setNewWeapon] = useState({ weapon_name: '', damage_die: '', description: '' });
  const [newSkill, setNewSkill] = useState({ skill_name: '', damage_die: '', description: '', action_type: '', cost: '' });
  const [newSpell, setNewSpell] = useState({ spell_name: '', damage_die: '', cost: '', action_type: '', description: '' });
  const [newEquipment, setNewEquipment] = useState({ name: '', type: '', description: '' });
  const [newLanguage, setNewLanguage] = useState('');

  // Styling
  const containerStyle = css`
    background: ${theme.colors.offWhiteBackground};
    padding: ${theme.spacing.large};
    border-radius: 12px;
    max-width: 1300px;
    margin: 0 auto;
    margin-top: ${theme.spacing.large};
    text-shadow: ${theme.effects.textDropShadow};
  `;

  const cardStyle = css`
    background: ${theme.colors.baseColor2};
    color: ${theme.colors.offWhiteBackground};
    margin-bottom: ${theme.spacing.medium};
    padding: ${theme.spacing.large};
    border-radius: 8px;
    box-shadow: 0px 3px 6px ${theme.colors.boxShadow};
    display: flex;
    align-items: left;
    text-shadow: ${theme.effects.textDropShadow};
  `;

  const buttonStyle = css`
    margin-top: ${theme.spacing.medium};
    margin-bottom: ${theme.spacing.medium};
    background-color: ${theme.colors.contrast};
    border: none;
    padding: 8px 16px;
    text-shadow: ${theme.effects.textDropShadow};
    &:hover {
      background-color: ${theme.colors.trim};
    }
  `;

  const equipmentItemStyle = css`
  padding: ${theme.spacing.small} 0;
  border-bottom: 1px solid ${theme.colors.trim};
  
  &:last-of-type {
    border-bottom: none; 
  }
  text-shadow: ${theme.effects.textDropShadow};
`;

const textStyle = css`
  min-height: 30px;  
  text-shadow: ${theme.effects.textDropShadow};
`;

const playerCardStyle = css`
  background: ${theme.colors.offWhiteBackground2};
  color: ${theme.colors.highContrastTextDark};
  padding: ${theme.spacing.medium};
  border-radius: 8px;
  box-shadow: 0px 2px 4px ${theme.colors.boxShadow};
  text-shadow: ${theme.effects.textDropShadow};
`;
const fetchCharacterData = async () => {
    try {
      const res = await axios.get(`/api/characters/${characterId}`);
      setCharacter(res.data);
      console.log("Fetched character data:", res.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // ====== CURRENT HP FUNCTION =======
  // const [currentHP, setCurrentHP] = useState(() => {
  //   return localStorage.getItem('currentHP') || character.current_hp || 0;
  // });
  // const [isEditingHP, setIsEditingHP] = useState(false);

  // const handleHPChange = (e) => setCurrentHP(e.target.value);

  // const handleHPKeyPress = (e) => {
  //   if (e.key === 'Enter') {
  //     localStorage.setItem('currentHP', currentHP);
  //     setIsEditingHP(false); 
  //   }
  // };
useEffect(() => {
  
    fetchCharacterData();
  }, [characterId]);

  const handleSaveChanges = async () => {
    try {
      // Update character attributes if there are any changes
      if (Object.keys(characterUpdates).length > 0) {
        await axios.put(`/api/characters/${characterId}`, characterUpdates);
        alert("Character base attributes updated successfully!");
        setCharacterUpdates({}); // Clear updates after submission
      }
  
      // Add new weapon if fields are filled
      if (newWeapon.weapon_name || newWeapon.damage_die || newWeapon.description) {
        await axios.post(`/api/characters/${characterId}/weapons`, newWeapon);
        alert("Weapon added successfully!");
        setNewWeapon({ weapon_name: '', damage_die: '', description: '' }); // Reset form
      }
  
      // Add new skill if fields are filled
      if (newSkill.skill_name || newSkill.damage_die || newSkill.description || newSkill.action_type || newSkill.cost) {
        await axios.post(`/api/characters/${characterId}/skills`, newSkill);
        alert("Skill added successfully!");
        setNewSkill({ skill_name: '', damage_die: '', description: '', action_type: '', cost: '' });
      }
  
      // Add new spell if fields are filled
      if (newSpell.spell_name || newSpell.damage_die || newSpell.description || newSpell.action_type || newSpell.cost) {
        await axios.post(`/api/characters/${characterId}/spells`, newSpell);
        alert("Spell added successfully!");
        setNewSpell({ spell_name: '', damage_die: '', description: '', action_type: '', cost: '' });
      }
  
      // Add new equipment if fields are filled
      if (newEquipment.name || newEquipment.type || newEquipment.description) {
        await axios.post(`/api/characters/${characterId}/equipment`, newEquipment);
        alert("Equipment added successfully!");
        setNewEquipment({ name: '', type: '', description: '' });
      }
  
      // Add new language if provided
      if (newLanguage) {
        await axios.post(`/api/characters/${characterId}/languages`, { language_name: newLanguage });
        alert("Language added successfully!");
        setNewLanguage(''); // Reset language field
      }
  
      // Refresh character data after saving
      await fetchCharacterData(); 
    } catch (error) {
      console.error("Error saving character changes:", error);
      alert("There was an error saving your changes. Please try again.");
    }
  };
  

  const handleAddItem = async (url, data, successMessage) => {
    try {
      await axios.post(url, data);
      alert(successMessage);
    } catch (error) {
      console.error(`Error adding item: ${error.message}`);
    }
  };

  const handleSaveCharacterChanges = async () => {
    try {
      await axios.put(`/api/characters/${characterId}`, characterUpdates);
      alert('Character updated successfully!');
    } catch (error) {
      console.error(`Error updating character: ${error.message}`);
    }
  };

  const toggleMode = () => setViewMode(!viewMode);

  const calculateModifiers = (stat) => Math.floor((stat - 10) / 2);

  const categorizedMinorStats = {
    strength: ['acrobatics', 'athletics', 'agility', 'lifting'],
    dexterity: ['sleight_of_hand', 'stealth', 'medicine', 'weapon_mastery', 'carving'],
    intelligence: ['history', 'wisdom', 'science', 'technology', 'foraging'],
    charisma: ['persuasion', 'deception', 'bargaining', 'performance', 'charm'],
    vitality: ['endurance', 'resistance'],
    willpower: ['feat_of_heroism', 'leadership', 'counter_charisma'],
    arcana: ['magical_knowledge', 'magic_save_modifier'],
    ferocity: ['intimidation', 'physical_save_modifier'],
  };

  const renderMinorStats = (majorStat, minorStats) => {
    const majorModifier = calculateModifiers(character[majorStat]);
    return (
      <Card css={cardStyle} className="mb-3">
        <Card.Header as="h4">
          {majorStat.charAt(0).toUpperCase() + majorStat.slice(1)} Minor Stats
        </Card.Header>
        <Card.Body>
          <Row>
            {minorStats.map((stat) => (
              <Col key={stat} md={6}>
                <p>
                  <strong>{stat.replace(/_/g, ' ').charAt(0).toUpperCase() + stat.replace(/_/g, ' ').slice(1)}: </strong> 
                  {character[stat] + majorModifier} (Base: {character[stat]}, Modifier: {majorModifier})
                </p>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    );
  };

  return (
    <div css={containerStyle}>
      {error && <Alert variant="danger">Error: {error}</Alert>}
      {loading ? (
        <Spinner animation="border" variant="primary" />
      ) : (
        <>
        <Row>
        <Col>
          <h1>{character.character_name}'s Character Sheet</h1>
          </Col>
          <Col>
          <Button css={buttonStyle} onClick={toggleMode}>Add / Edit Character Details</Button>
          </Col>
          </Row>
          {viewMode ? (
            <>
              {/* Basic Information */}
              <Card css={cardStyle} className="mb-3">
    <Card.Header as="h3">Basic Information</Card.Header>
    <Card.Body>
      <Row>
        <Col><p css={textStyle}><strong>Name:</strong> {character.character_name}</p></Col>
        <Col><p css={textStyle}><strong>Race:</strong> {character.race}</p></Col>
        <Col><p css={textStyle}><strong>Vocation:</strong> {character.vocation}</p></Col>
        <Col><p css={textStyle}><strong>Specialty:</strong> {character.specialty || 'N/A'}</p></Col>
        <Col><p css={textStyle}><strong>Height:</strong> {character.height}</p></Col>
        <Col><p css={textStyle}><strong>Age:</strong> {character.age}</p></Col>
      </Row>
      <Row>
        <Col><p css={textStyle}><strong>Max HP:</strong> {character.max_hp}</p></Col>
        <Col><p css={textStyle}><strong>Current HP:</strong> {character.current_hp}</p></Col>
        <Col><p css={textStyle}><strong>Focus Points:</strong> {character.focus_points}</p></Col>
        <Col><p css={textStyle}><strong>Soul Rank:</strong> {character.soul_rank}</p></Col>
        <Col><p css={textStyle}><strong>Speed Class:</strong> {character.speed_class}</p></Col>
      </Row>
      <Row>
        <Col><p css={textStyle}><strong>Current Temporary HP:</strong> {character.current_thp}</p></Col>
        <Col><p css={textStyle}><strong>Current Armor Rating:</strong> {character.current_ar}</p></Col>
        <Col><p css={textStyle}><strong>Current Over Shields:</strong> {character.current_os}</p></Col>
        <Col><p css={textStyle}><strong>Current Magic Resistance:</strong> {character.current_mr}</p></Col>
      </Row>
    </Card.Body>
  </Card>

              {/* Major Stats & Modifiers */}
              <Card css={cardStyle} className="mb-3">
                <Card.Header as="h3">Major Stats & Modifiers</Card.Header>
                <Card.Body>
                  <Row>
                    {['strength', 'dexterity', 'intelligence', 'charisma', 'vitality'].map((stat) => (
                      <Col md={6} key={stat}>
                        <p>
                          <strong>{stat.charAt(0).toUpperCase() + stat.slice(1)}: </strong> 
                          {character[stat]} (Modifier: {calculateModifiers(character[stat])})
                        </p>
                      </Col>
                    ))}
                    {['willpower', 'arcana', 'ferocity'].map((spec) => (
                      <Col md={6} key={spec}>
                        <p>
                          <strong>{spec.charAt(0).toUpperCase() + spec.slice(1)}: </strong> 
                          {character[spec]} (Single Spec Modifier)
                        </p>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>

              {/* Render categorized minor stats with modifiers */}
              {Object.entries(categorizedMinorStats).map(([majorStat, minorStats]) => (
                renderMinorStats(majorStat, minorStats)
              ))}

        {/* Skills */}
{character.skills && character.skills.length > 0 && (
  <Card css={cardStyle} className="mb-3">
    <Card.Header as="h3">Skills</Card.Header>
    <Card.Body>
      <Row>
        {character.skills.map((skill, index) => (
          <Col md={6} key={`skill-${index}`}>
            <Card css={playerCardStyle} className="mb-3">
              <Card.Body>
                <p css={textStyle}><strong>Skill Name:</strong> {skill.skill_name}</p>
                {skill.description && <p css={textStyle}><strong>Description:</strong> {skill.description}</p>}
                {skill.damage_die && <p css={textStyle}><strong>Damage Die:</strong> {skill.damage_die}</p>}
                {skill.action_type && <p css={textStyle}><strong>Action Type:</strong> {skill.action_type}</p>}
                {skill.cost && <p css={textStyle}><strong>Cost:</strong> {skill.cost}</p>}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Card.Body>
  </Card>
)}

       {/* Spells */}
{character.spells && character.spells.length > 0 && (
  <Card css={cardStyle} className="mb-3">
    <Card.Header as="h3">Spells</Card.Header>
    <Card.Body>
      <Row>
        {character.spells.map((spell, index) => (
          <Col md={6} key={`spell-${index}`}>
            <Card css={playerCardStyle} className="mb-3">
              <Card.Body>
                <p css={textStyle}><strong>Spell Name:</strong> {spell.spell_name}</p>
                {spell.description && <p css={textStyle}><strong>Description:</strong> {spell.description}</p>}
                {spell.damage_die && <p css={textStyle}><strong>Damage Die:</strong> {spell.damage_die}</p>}
                {spell.action_type && <p css={textStyle}><strong>Action Type:</strong> {spell.action_type}</p>}
                {spell.cost && <p css={textStyle}><strong>Cost:</strong> {spell.cost}</p>}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Card.Body>
  </Card>
)}


             {/* Weapons */}
{character.weapons && character.weapons.length > 0 && (
  <Card css={cardStyle} className="mb-3">
    <Card.Header as="h3">Weapons</Card.Header>
    <Card.Body>
      <Row>
        {character.weapons.map((weapon, index) => (
          <Col md={6} key={index}>
            <Card css={playerCardStyle} className="mb-3">
              <Card.Body>
                <p css={textStyle}><strong>Weapon Name:</strong> {weapon.weapon_name}</p>
                {weapon.description && <p css={textStyle}><strong>Description:</strong> {weapon.description}</p>}
                {weapon.damage_die && <p css={textStyle}><strong>Damage Die:</strong> {weapon.damage_die}</p>}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Card.Body>
  </Card>
)}

              {/* Equipment */}
              {character.equipment && character.equipment.length > 0 && (
  <Card css={cardStyle} className="mb-3">
    <Card.Header as="h3">Equipment</Card.Header>
    <Card.Body>
      <Accordion>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Show Equipment Details</Accordion.Header>
          <Accordion.Body>
            {character.equipment.map((equip, index) => (
              <div key={`equipment-${index}`} css={equipmentItemStyle}>
                <p><strong>Name:</strong> {equip.name}</p>
                {equip.type && <p><strong>Type:</strong> {equip.type}</p>}
                {equip.description && <p><strong>Description:</strong> {equip.description}</p>}
              </div>
            ))}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Card.Body>
  </Card>
)}

              {/* Languages */}
              {character.languages && character.languages.length > 0 && (
  <Card css={cardStyle} className="mb-3">
    <Card.Header as="h3">Languages</Card.Header>
    <Card.Body>
      <Row>
        {character.languages.map((language, index) => (
          <Col md={6} key={`language-${index}`}>
            <p><strong>Language:</strong> {language}</p>
          </Col>
        ))}
      </Row>
    </Card.Body>
  </Card>
)}


             
            </>
          ) : (
            <div>
              <Row>
                <Col>
  <h3>Edit Character Base Attributes</h3>
  </Col>
  <Col>
  <Button css={buttonStyle} onClick={() => handleSaveChanges()}>Save Changes</Button>
  </Col>
  </Row>
  <Form>
    {/* Character Basic Info */}
    <h4>Basic Information</h4>
    <Row>
      <Col md={6}>
        <Form.Group controlId="characterName">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            defaultValue={character?.character_name}
            onChange={(e) => setCharacterUpdates({ ...characterUpdates, name: e.target.value })}
          />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group controlId="characterRace">
          <Form.Label>Race</Form.Label>
          <Form.Control
            type="text"
            defaultValue={character?.race}
            onChange={(e) => setCharacterUpdates({ ...characterUpdates, race: e.target.value })}
          />
        </Form.Group>
      </Col>
    </Row>

    {/* Major Stats */}
    <h4>Major Stats</h4>
    <Row>
      {['strength', 'dexterity', 'intelligence', 'charisma', 'vitality', 'willpower', 'arcana', 'ferocity'].map((stat) => (
        <Col md={3} key={stat}>
          <Form.Group controlId={stat}>
            <Form.Label>{stat.charAt(0).toUpperCase() + stat.slice(1)}</Form.Label>
            <Form.Control
              type="number"
              defaultValue={character?.[stat]}
              onChange={(e) => setCharacterUpdates({ ...characterUpdates, [stat]: parseInt(e.target.value) })}
            />
          </Form.Group>
        </Col>
      ))}
    </Row>

    {/* Minor Stats */}
    <h4>Minor Stats</h4>
    <Row>
      {['acrobatics', 'athletics', 'agility', 'lifting', 'sleight_of_hand', 'stealth', 'medicine', 'weapon_mastery', 'carving', 'history', 'wisdom', 'science', 'technology', 'foraging', 'persuasion', 'deception', 'bargaining', 'performance', 'charm', 'endurance', 'resistance'].map((stat) => (
        <Col md={4} key={stat}>
          <Form.Group controlId={stat}>
            <Form.Label>{stat.replace(/_/g, ' ')}</Form.Label>
            <Form.Control
              type="number"
              defaultValue={character?.[stat]}
              onChange={(e) => setCharacterUpdates({ ...characterUpdates, [stat]: parseInt(e.target.value) })}
            />
          </Form.Group>
        </Col>
      ))}
    </Row>

    {/* New Weapon */}
    <h4>Add New Weapon</h4>
    <Row>
      <Col md={4}>
        <Form.Group controlId="newWeaponName">
          <Form.Label>Weapon Name</Form.Label>
          <Form.Control
            type="text"
            value={newWeapon.weapon_name}
            onChange={(e) => setNewWeapon({ ...newWeapon, weapon_name: e.target.value })}
          />
        </Form.Group>
      </Col>
      <Col md={4}>
        <Form.Group controlId="newWeaponDamageDie">
          <Form.Label>Damage Die</Form.Label>
          <Form.Control
            type="text"
            value={newWeapon.damage_die}
            onChange={(e) => setNewWeapon({ ...newWeapon, damage_die: e.target.value })}
          />
        </Form.Group>
      </Col>
      <Col md={4}>
        <Form.Group controlId="newWeaponDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={1}
            value={newWeapon.description}
            onChange={(e) => setNewWeapon({ ...newWeapon, description: e.target.value })}
          />
        </Form.Group>
      </Col>
    </Row>

    {/* New Skill */}
    <h4>Add New Skill</h4>
    <Row>
      <Col md={3}>
        <Form.Group controlId="newSkillName">
          <Form.Label>Skill Name</Form.Label>
          <Form.Control
            type="text"
            value={newSkill.skill_name}
            onChange={(e) => setNewSkill({ ...newSkill, skill_name: e.target.value })}
          />
        </Form.Group>
      </Col>
      <Col md={3}>
        <Form.Group controlId="newSkillDamageDie">
          <Form.Label>Damage Die</Form.Label>
          <Form.Control
            type="text"
            value={newSkill.damage_die}
            onChange={(e) => setNewSkill({ ...newSkill, damage_die: e.target.value })}
          />
        </Form.Group>
      </Col>
      <Col md={3}>
        <Form.Group controlId="newSkillActionType">
          <Form.Label>Action Type</Form.Label>
          <Form.Control
            type="text"
            value={newSkill.action_type}
            onChange={(e) => setNewSkill({ ...newSkill, action_type: e.target.value })}
          />
        </Form.Group>
      </Col>
      <Col md={3}>
        <Form.Group controlId="newSkillCost">
          <Form.Label>Cost</Form.Label>
          <Form.Control
            type="text"
            value={newSkill.cost}
            onChange={(e) => setNewSkill({ ...newSkill, cost: e.target.value })}
          />
        </Form.Group>
      </Col>
      <Col md={12}>
        <Form.Group controlId="newSkillDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={1}
            value={newSkill.description}
            onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
          />
        </Form.Group>
      </Col>
    </Row>

    {/* New Spell */}
    <h4>Add New Spell</h4>
    <Row>
      <Col md={3}>
        <Form.Group controlId="newSpellName">
          <Form.Label>Spell Name</Form.Label>
          <Form.Control
            type="text"
            value={newSpell.spell_name}
            onChange={(e) => setNewSpell({ ...newSpell, spell_name: e.target.value })}
          />
        </Form.Group>
      </Col>
      <Col md={3}>
        <Form.Group controlId="newSpellDamageDie">
          <Form.Label>Damage Die</Form.Label>
          <Form.Control
            type="text"
            value={newSpell.damage_die}
            onChange={(e) => setNewSpell({ ...newSpell, damage_die: e.target.value })}
          />
        </Form.Group>
      </Col>
      <Col md={3}>
        <Form.Group controlId="newSpellActionType">
          <Form.Label>Action Type</Form.Label>
          <Form.Control
            type="text"
            value={newSpell.action_type}
            onChange={(e) => setNewSpell({ ...newSpell, action_type: e.target.value })}
          />
        </Form.Group>
      </Col>
      <Col md={3}>
        <Form.Group controlId="newSpellCost">
          <Form.Label>Cost</Form.Label>
          <Form.Control
            type="text"
            value={newSpell.cost}
            onChange={(e) => setNewSpell({ ...newSpell, cost: e.target.value })}
          />
        </Form.Group>
      </Col>
      <Col md={12}>
        <Form.Group controlId="newSpellDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={1}
            value={newSpell.description}
            onChange={(e) => setNewSpell({ ...newSpell, description: e.target.value })}
          />
        </Form.Group>
      </Col>
    </Row>

    {/* New Equipment */}
    <h4>Add New Equipment</h4>
    <Row>
      <Col md={4}>
        <Form.Group controlId="newEquipmentName">
          <Form.Label>Equipment Name</Form.Label>
          <Form.Control
            type="text"
            value={newEquipment.name}
            onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
          />
        </Form.Group>
      </Col>
      <Col md={4}>
        <Form.Group controlId="newEquipmentType">
          <Form.Label>Type</Form.Label>
          <Form.Control
            type="text"
            value={newEquipment.type}
            onChange={(e) => setNewEquipment({ ...newEquipment, type: e.target.value })}
          />
        </Form.Group>
      </Col>
      <Col md={4}>
        <Form.Group controlId="newEquipmentDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={1}
            value={newEquipment.description}
            onChange={(e) => setNewEquipment({ ...newEquipment, description: e.target.value })}
          />
        </Form.Group>
      </Col>
    </Row>

    {/* New Language */}
    <h4>Add New Language</h4>
    <Row>
      <Col md={4}>
        <Form.Group controlId="newLanguageName">
          <Form.Label>Language</Form.Label>
          <Form.Control
            type="text"
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
          />
        </Form.Group>
      </Col>
    </Row>

    <Button css={buttonStyle} onClick={() => handleSaveChanges()}>Save Changes</Button>
  </Form>
</div>

          )}
        </>
      )}
    </div>
  );
};

export default CharacterSheet;
