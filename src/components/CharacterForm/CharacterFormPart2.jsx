/** @jsxImportSource @emotion/react */
import React, { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { css } from '@emotion/react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useTheme } from '@emotion/react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { saveCharacterPart2 } from '../../redux/actions/characterActions';

const CharacterFormPart2 = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const history = useHistory();

  console.log("Current theme:", theme);

  const formStyle = css`
  background: ${theme.colors.baseColor2};
  padding: ${theme.spacing.large};
  border-radius: 12px;
  box-shadow: 0px 4px 10px ${theme.colors.boxShadow};
  color: ${theme.colors.offWhiteBackground};
  max-width: 1200px;
  margin: 0 auto;
  margin-top: ${theme.spacing.large};
`;

const inputStyle = css`
  background-color: ${theme.colors.offWhiteBackground};
  border: 1px solid ${theme.colors.trim};
  border-radius: 8px;
  margin: ${theme.spacing.small} 0;
  padding: ${theme.spacing.small};
  width: 100%;
  &:focus {
    border-color: ${theme.colors.baseColor};
    box-shadow: 0 0 5px ${theme.colors.baseColor};
  }
`;

const buttonStyle = css`
  background-color: ${theme.colors.baseColor};
  border-color: ${theme.colors.baseColor};
  margin-top: ${theme.spacing.large};
  padding: ${theme.spacing.small} ${theme.spacing.medium};
  font-size: ${theme.typography.sizes.large};
  &:hover {
    background-color: ${theme.colors.trim};
    border-color: ${theme.colors.baseColor2};
  }
`;

const labelStyle = css`
  color: ${theme.colors.trim};
  font-weight: ${theme.typography.weights.bold};
  margin-bottom: ${theme.spacing.small};
`;

const headerStyle = css`
  color: ${theme.colors.trim};
  font-weight: ${theme.typography.weights.bold};
  margin-bottom: ${theme.spacing.medium};
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
    persuasion: 0,
    deception: 0,
    bargaining: 0,
    performance: 0,
    charm: 0,
    acrobatics: 0,
    athletics: 0,
    agility: 0,
    lifting: 0,
    sleight_of_hand: 0,
    stealth: 0,
    medicine: 0,
    weapon_mastery: 0,
    carving: 0,
    history: 0,
    wisdom: 0,
    science: 0,
    technology: 0,
    foraging: 0,
    endurance: 0,
    resistance: 0,
    feat_of_heroism: 0,
    leadership: 0,
    counter_charisma: 0,
    magical_knowledge: 0,
    magic_save_modifier: 0,
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
    dispatch(saveCharacterPart2(formData));
    history.push("/characterstats3");
  };

  return (
    <Form css={formStyle} className="row">
      {/* Major Stats */}
      <h4 css={headerStyle}>Major Stats</h4>
      <Row>
        <Col md={6}>
          <Form.Group controlId="charisma">
            <Form.Label css={labelStyle}>Charisma</Form.Label>
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
            <Form.Label css={labelStyle}>Strength</Form.Label>
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
            <Form.Label css={labelStyle}>Dexterity</Form.Label>
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
            <Form.Label css={labelStyle}>Intelligence</Form.Label>
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
            <Form.Label css={labelStyle}>Vitality</Form.Label>
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
            <Form.Label css={labelStyle}>Willpower</Form.Label>
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
            <Form.Label css={labelStyle}>Arcana</Form.Label>
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
            <Form.Label css={labelStyle}>Ferocity</Form.Label>
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
      <h4 css={headerStyle}>Charisma Minor Stats</h4>
      <Row>
        <Col md={4}>
          <Form.Group controlId="persuasion">
            <Form.Label css={labelStyle}>Persuasion</Form.Label>
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
            <Form.Label css={labelStyle}>Deception</Form.Label>
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
            <Form.Label css={labelStyle}>Bargaining</Form.Label>
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
            <Form.Label css={labelStyle}>Performance</Form.Label>
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
            <Form.Label css={labelStyle}>Charm</Form.Label>
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
      <h4 css={headerStyle}>Strength Minor Stats</h4>
      <Row>
        <Col md={4}>
          <Form.Group controlId="acrobatics">
            <Form.Label css={labelStyle}>Acrobatics</Form.Label>
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
            <Form.Label css={labelStyle}>Athletics</Form.Label>
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
            <Form.Label css={labelStyle}>Agility</Form.Label>
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
            <Form.Label css={labelStyle}>Lifting</Form.Label>
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
      <h4 css={headerStyle}>Dexterity Minor Stats</h4>
      <Row>
        <Col md={4}>
          <Form.Group controlId="sleight_of_hand">
            <Form.Label css={labelStyle}>Sleight of Hand</Form.Label>
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
            <Form.Label css={labelStyle}>Stealth</Form.Label>
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
            <Form.Label css={labelStyle}>Medicine</Form.Label>
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
            <Form.Label css={labelStyle}>Weapon Mastery</Form.Label>
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
            <Form.Label css={labelStyle}>Carving</Form.Label>
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
      <h4 css={headerStyle}>Intelligence Minor Stats</h4>
      <Row>
        <Col md={4}>
          <Form.Group controlId="history">
            <Form.Label css={labelStyle}>History</Form.Label>
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
            <Form.Label css={labelStyle}>Wisdom</Form.Label>
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
            <Form.Label css={labelStyle}>Science</Form.Label>
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
            <Form.Label css={labelStyle}>Technology</Form.Label>
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
            <Form.Label css={labelStyle}>Foraging</Form.Label>
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
      <h4 css={headerStyle}>Vitality Minor Stats</h4>
      <Row>
        <Col md={6}>
          <Form.Group controlId="endurance">
            <Form.Label css={labelStyle}>Endurance</Form.Label>
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
            <Form.Label css={labelStyle}>Resistance</Form.Label>
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
      <h4 css={headerStyle}>Willpower Minor Stats</h4>
      <Row>
        <Col md={4}>
          <Form.Group controlId="feat_of_heroism">
            <Form.Label css={labelStyle}>Feat of Heroism</Form.Label>
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
            <Form.Label css={labelStyle}>Leadership</Form.Label>
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
            <Form.Label css={labelStyle}>Counter Charisma</Form.Label>
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
      <h4 css={headerStyle}>Arcana Minor Stats</h4>
      <Row>
        <Col md={6}>
          <Form.Group controlId="magical_knowledge">
            <Form.Label css={labelStyle}>Magical Knowledge</Form.Label>
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
            <Form.Label css={labelStyle}>Magic Save Modifier</Form.Label>
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
      <h4 css={headerStyle}>Ferocity Minor Stats</h4>
      <Row>
        <Col md={6}>
          <Form.Group controlId="intimidation">
            <Form.Label css={labelStyle}>Intimidation</Form.Label>
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
            <Form.Label css={labelStyle}>Physical Save Modifier</Form.Label>
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

      <Button css={buttonStyle} onClick={handleSubmit}>
        Next
      </Button>
    </Form>
  );

};

export default CharacterFormPart2;
