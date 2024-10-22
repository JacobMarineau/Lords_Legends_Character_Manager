
import React, { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { css } from '@emotion/react';
import { useTheme } from '@emotion/react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { saveCharacterPart2 } from '../../redux/actions/characterActions';

const CharacterFormPart2 = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const history = useHistory(); 

  // Styling using Emotion and Theme
  const formStyle = css`
    margin-top: 20px;
    background: ${theme.colors.baseColor2};
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0px 4px 10px ${theme.colors.boxShadow};
    color: ${theme.colors.offWhiteBackground};
  `;

  const inputStyle = css`
    background-color: ${theme.colors.offWhiteBackground};
    border: 1px solid ${theme.colors.trim};
    border-radius: 8px;
    margin: 8px 0;
    text-align: center;
    &:focus {
      border-color: ${theme.colors.baseColor};
      box-shadow: 0 0 5px ${theme.colors.baseColor};
    }
  `;

  const [formData, setFormData] = useState({
    charisma: 0,
    strength: 0,
    dexterity: 0,
    intelligence: 0,
    vitality: 0,
    willpower: 0,
    arcana: 0,
    ferocity: 0,
    // Charisma minor stats
    persuasion: 0,
    deception: 0,
    bargaining: 0,
    performance: 0,
    charm: 0,
    // Strength minor stats
    acrobatics: 0,
    athletics: 0,
    agility: 0,
    lifting: 0,
    // Dexterity minor stats
    sleight_of_hand: 0,
    stealth: 0,
    medicine: 0,
    weapon_mastery: 0,
    carving: 0,
    // Intelligence minor stats
    history: 0,
    wisdom: 0,
    science: 0,
    technology: 0,
    foraging: 0,
    // Vitality minor stats
    endurance: 0,
    resistance: 0,
    // Willpower minor stats
    feat_of_heroism: 0,
    leadership: 0,
    counter_charisma: 0,
    // Arcana minor stats
    magical_knowledge: 0,
    magic_save_modifier: 0,
    // Ferocity minor stats
    intimidation: 0,
    physical_save_modifier: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: parseInt(value, 10),
    }));
  };

  const handleSubmit = () => {
    console.log('Form Part 2 Data:', formData); 
    dispatch(saveCharacterPart2(formData)); 
    history.push("/characterstats3");
  };

  return (
    <Form css={formStyle} className="row">
      {/* Major Stats */}
      <h4>Major Stats</h4>
      <Row>
        <Col md={6}>
          <Form.Group controlId="charisma">
            <Form.Label>Charisma</Form.Label>
            <Form.Control
              type="number"
              name="charisma"
              value={formData.charisma}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="strength">
            <Form.Label>Strength</Form.Label>
            <Form.Control
              type="number"
              name="strength"
              value={formData.strength}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form.Group controlId="dexterity">
            <Form.Label>Dexterity</Form.Label>
            <Form.Control
              type="number"
              name="dexterity"
              value={formData.dexterity}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="intelligence">
            <Form.Label>Intelligence</Form.Label>
            <Form.Control
              type="number"
              name="intelligence"
              value={formData.intelligence}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form.Group controlId="vitality">
            <Form.Label>Vitality</Form.Label>
            <Form.Control
              type="number"
              name="vitality"
              value={formData.vitality}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="willpower">
            <Form.Label>Willpower</Form.Label>
            <Form.Control
              type="number"
              name="willpower"
              value={formData.willpower}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form.Group controlId="arcana">
            <Form.Label>Arcana</Form.Label>
            <Form.Control
              type="number"
              name="arcana"
              value={formData.arcana}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="ferocity">
            <Form.Label>Ferocity</Form.Label>
            <Form.Control
              type="number"
              name="ferocity"
              value={formData.ferocity}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Charisma Minor Stats */}
      <h4>Charisma Minor Stats</h4>
      <Row>
        <Col md={4}>
          <Form.Group controlId="persuasion">
            <Form.Label>Persuasion</Form.Label>
            <Form.Control
              type="number"
              name="persuasion"
              value={formData.persuasion}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="deception">
            <Form.Label>Deception</Form.Label>
            <Form.Control
              type="number"
              name="deception"
              value={formData.deception}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="bargaining">
            <Form.Label>Bargaining</Form.Label>
            <Form.Control
              type="number"
              name="bargaining"
              value={formData.bargaining}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form.Group controlId="performance">
            <Form.Label>Performance</Form.Label>
            <Form.Control
              type="number"
              name="performance"
              value={formData.performance}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="charm">
            <Form.Label>Charm</Form.Label>
            <Form.Control
              type="number"
              name="charm"
              value={formData.charm}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Strength Minor Stats */}
      <h4>Strength Minor Stats</h4>
      <Row>
        <Col md={4}>
          <Form.Group controlId="acrobatics">
            <Form.Label>Acrobatics</Form.Label>
            <Form.Control
              type="number"
              name="acrobatics"
              value={formData.acrobatics}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="athletics">
            <Form.Label>Athletics</Form.Label>
            <Form.Control
              type="number"
              name="athletics"
              value={formData.athletics}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="agility">
            <Form.Label>Agility</Form.Label>
            <Form.Control
              type="number"
              name="agility"
              value={formData.agility}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form.Group controlId="lifting">
            <Form.Label>Lifting</Form.Label>
            <Form.Control
              type="number"
              name="lifting"
              value={formData.lifting}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>
        </Col>
      </Row>
            {/* Dexterity Minor Stats */}
        <h4>Dexterity Minor Stats</h4>
        <Row>
        <Col md={4}>
            <Form.Group controlId="sleight_of_hand">
            <Form.Label>Sleight of Hand</Form.Label>
            <Form.Control
                type="number"
                name="sleight_of_hand"
                value={formData.sleight_of_hand}
                onChange={handleChange}
                css={inputStyle}
            />
            </Form.Group>
        </Col>
        <Col md={4}>
            <Form.Group controlId="stealth">
            <Form.Label>Stealth</Form.Label>
            <Form.Control
                type="number"
                name="stealth"
                value={formData.stealth}
                onChange={handleChange}
                css={inputStyle}
            />
            </Form.Group>
        </Col>
        <Col md={4}>
            <Form.Group controlId="medicine">
            <Form.Label>Medicine</Form.Label>
            <Form.Control
                type="number"
                name="medicine"
                value={formData.medicine}
                onChange={handleChange}
                css={inputStyle}
            />
            </Form.Group>
        </Col>
        </Row>
        <Row>
        <Col md={6}>
            <Form.Group controlId="weapon_mastery">
            <Form.Label>Weapon Mastery</Form.Label>
            <Form.Control
                type="number"
                name="weapon_mastery"
                value={formData.weapon_mastery}
                onChange={handleChange}
                css={inputStyle}
            />
            </Form.Group>
        </Col>
        <Col md={6}>
            <Form.Group controlId="carving">
            <Form.Label>Carving</Form.Label>
            <Form.Control
                type="number"
                name="carving"
                value={formData.carving}
                onChange={handleChange}
                css={inputStyle}
            />
            </Form.Group>
        </Col>
        </Row>
        {/* Intelligence Minor Stats */}
        <h4>Intelligence Minor Stats</h4>
        <Row>
        <Col md={4}>
            <Form.Group controlId="history">
            <Form.Label>History</Form.Label>
            <Form.Control
                type="number"
                name="history"
                value={formData.history}
                onChange={handleChange}
                css={inputStyle}
            />
            </Form.Group>
        </Col>
        <Col md={4}>
            <Form.Group controlId="wisdom">
            <Form.Label>Wisdom</Form.Label>
            <Form.Control
                type="number"
                name="wisdom"
                value={formData.wisdom}
                onChange={handleChange}
                css={inputStyle}
            />
            </Form.Group>
        </Col>
        <Col md={4}>
            <Form.Group controlId="science">
            <Form.Label>Science</Form.Label>
            <Form.Control
                type="number"
                name="science"
                value={formData.science}
                onChange={handleChange}
                css={inputStyle}
            />
            </Form.Group>
        </Col>
        </Row>
        <Row>
        <Col md={6}>
            <Form.Group controlId="technology">
            <Form.Label>Technology</Form.Label>
            <Form.Control
                type="number"
                name="technology"
                value={formData.technology}
                onChange={handleChange}
                css={inputStyle}
            />
            </Form.Group>
        </Col>
        <Col md={6}>
            <Form.Group controlId="foraging">
            <Form.Label>Foraging</Form.Label>
            <Form.Control
                type="number"
                name="foraging"
                value={formData.foraging}
                onChange={handleChange}
                css={inputStyle}
            />
            </Form.Group>
        </Col>
        </Row>
        {/* Vitality Minor Stats */}
        <h4>Vitality Minor Stats</h4>
        <Row>
        <Col md={6}>
            <Form.Group controlId="endurance">
            <Form.Label>Endurance</Form.Label>
            <Form.Control
                type="number"
                name="endurance"
                value={formData.endurance}
                onChange={handleChange}
                css={inputStyle}
            />
            </Form.Group>
        </Col>
        <Col md={6}>
            <Form.Group controlId="resistance">
            <Form.Label>Resistance</Form.Label>
            <Form.Control
                type="number"
                name="resistance"
                value={formData.resistance}
                onChange={handleChange}
                css={inputStyle}
            />
            </Form.Group>
        </Col>
        </Row>
        {/* Willpower Minor Stats */}
        <h4>Willpower Minor Stats</h4>
        <Row>
        <Col md={4}>
            <Form.Group controlId="feat_of_heroism">
            <Form.Label>Feat of Heroism</Form.Label>
            <Form.Control
                type="number"
                name="feat_of_heroism"
                value={formData.feat_of_heroism}
                onChange={handleChange}
                css={inputStyle}
            />
            </Form.Group>
        </Col>
        <Col md={4}>
            <Form.Group controlId="leadership">
            <Form.Label>Leadership</Form.Label>
            <Form.Control
                type="number"
                name="leadership"
                value={formData.leadership}
                onChange={handleChange}
                css={inputStyle}
            />
            </Form.Group>
        </Col>
        <Col md={4}>
            <Form.Group controlId="counter_charisma">
            <Form.Label>Counter Charisma</Form.Label>
            <Form.Control
                type="number"
                name="counter_charisma"
                value={formData.counter_charisma}
                onChange={handleChange}
                css={inputStyle}
            />
            </Form.Group>
        </Col>
        </Row>
        {/* Arcana Minor Stats */}
        <h4>Arcana Minor Stats</h4>
        <Row>
        <Col md={6}>
            <Form.Group controlId="magical_knowledge">
            <Form.Label>Magical Knowledge</Form.Label>
            <Form.Control
                type="number"
                name="magical_knowledge"
                value={formData.magical_knowledge}
                onChange={handleChange}
                css={inputStyle}
            />
            </Form.Group>
        </Col>
        <Col md={6}>
            <Form.Group controlId="magic_save_modifier">
            <Form.Label>Magic Save Modifier</Form.Label>
            <Form.Control
                type="number"
                name="magic_save_modifier"
                value={formData.magic_save_modifier}
                onChange={handleChange}
                css={inputStyle}
            />
            </Form.Group>
        </Col>
        </Row>
        {/* Ferocity Minor Stats */}
        <h4>Ferocity Minor Stats</h4>
        <Row>
        <Col md={6}>
            <Form.Group controlId="intimidation">
            <Form.Label>Intimidation</Form.Label>
            <Form.Control
                type="number"
                name="intimidation"
                value={formData.intimidation}
                onChange={handleChange}
                css={inputStyle}
            />
            </Form.Group>
        </Col>
        <Col md={6}>
            <Form.Group controlId="physical_save_modifier">
            <Form.Label>Physical Save Modifier</Form.Label>
            <Form.Control
                type="number"
                name="physical_save_modifier"
                value={formData.physical_save_modifier}
                onChange={handleChange}
                css={inputStyle}
            />
            </Form.Group>
        </Col>
        </Row>

      <Button variant="primary" onClick={handleSubmit}>
        Next
      </Button>
    </Form>
  );
};

export default CharacterFormPart2;
