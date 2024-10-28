/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { css } from '@emotion/react';
import { useTheme } from '@emotion/react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { saveCharacterPart1 } from '../../redux/actions/characterActions';
import { updateRaceAndVocation } from '../../redux/actions/characterActions';
import races from '../../../server/data/races.json';

import vocations from '../../../server/data/vocations.json';

const CharacterFormPart1 = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const history = useHistory();

  const formStyle = css`
  background: ${theme.colors.baseColor2};
  padding: ${theme.spacing.large};
  border-radius: 12px;
  box-shadow: 0px 4px 10px ${theme.colors.boxShadow};
  color: ${theme.colors.offWhiteBackground};
  max-width: 1200px;
  margin: 0 auto;
   margin-top: ${theme.spacing.xxlarge};
    text-shadow: ${theme.effects.textDropShadow};
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
       text-shadow: ${theme.effects.textDropShadow};
    }
  `;

  const buttonStyle = css`
    background-color: ${theme.colors.baseColor};
    border-color: ${theme.colors.baseColor};
    margin-top: ${theme.spacing.large};
    padding: ${theme.spacing.small} ${theme.spacing.medium};
    font-size: ${theme.typography.sizes.large};
    &:hover {
      background-color: ${theme.colors.baseColor2};
      border-color: ${theme.colors.baseColor2};
       text-shadow: ${theme.effects.textDropShadow};
       border-color: ${theme.colors.trim};
    }
  `;

  const labelStyle = css`
    color: ${theme.colors.highContrastTextLight};
    font-weight: ${theme.typography.weights.bold};
    margin-bottom: ${theme.spacing.small};
     text-shadow: ${theme.effects.textDropShadow};
  `;

  const [formData, setFormData] = useState({
    name: '',
    race: '',
    vocation: '',
    specialty: '',
    max_hp: 10,
    current_hp: 10,
    focus_points: 0,
    soul_rank: 0,
    speed_class: 1,
    height: 0,
    age: 0,
    glint_pieces: 0,
    current_thp: 0,
    current_ar: 0,
    current_os: 0,
    current_mr: 0,
    extended_willpower: 0,
    innate_willpower: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const [vocationData, setVocationData] = useState(null);
  const [raceData, setRaceData] = useState(null);

  console.log("Vocation Data:", vocationData);
console.log("Race Data:", raceData);

  const handleSubmit = () => {
    dispatch(saveCharacterPart1(formData));
    history.push("/characterstats2");

    const selectedRaceName = formData.race.toLowerCase();
    const selectedVocationName = formData.vocation.toLowerCase();
  
    const selectedRace = races[selectedRaceName];
    const selectedVocation = vocations[selectedVocationName];
  
    if (!selectedRace || !selectedVocation) {
      console.error("Invalid race or vocation selection");
      return;
    }

    dispatch({
        type: 'UPDATE_RACE_AND_VOCATION',
        payload: {
          raceName: selectedRaceName,
          race: selectedRace,
          vocationName: selectedVocationName,
          vocation: selectedVocation
        }
      });
    
  
  };
  

  useEffect(() => {
    if (formData.vocation) {
      const selectedVocation = vocations[formData.vocation.toLowerCase()];
      if (selectedVocation) {
        setVocationData(selectedVocation);
      }
    }
  }, [formData.vocation]);
  
  useEffect(() => {
    if (formData.race) {
      const selectedRace = races[formData.race.toLowerCase()];
      if (selectedRace) {
        setRaceData(selectedRace);  
      }
    }
  }, [formData.race]);
  

  return (
    <Form css={formStyle}>
      <Row>
        {/* Left column for Name, Specialty, Race, Vocation */}
        <Col xs={12} md={6}> 
          <Form.Group controlId="name">
            <Form.Label css={labelStyle}>Character Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter character name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>

          <Form.Group controlId="specialty">
            <Form.Label css={labelStyle}>Specialty</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter character specialty"
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>

          <Form.Group controlId="race">
            <Form.Label>Race</Form.Label>
            <Form.Control
              as="select"
              name="race"
              value={formData.race}
              onChange={handleChange}
            >
              <option value="">Select a race</option>
              {Object.keys(races).map((raceKey) => (
                <option key={raceKey} value={raceKey}>
                  {raceKey.charAt(0).toUpperCase() + raceKey.slice(1)}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="vocation">
            <Form.Label>Vocation</Form.Label>
            <Form.Control
              as="select"
              name="vocation"
              value={formData.vocation}
              onChange={handleChange}
            >
              <option value="">Select a vocation</option>
              {Object.keys(vocations).map((vocationKey) => (
                <option key={vocationKey} value={vocationKey}>
                  {vocationKey.charAt(0).toUpperCase() + vocationKey.slice(1)}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>

        {/* Right column for Stats */}
        <Col xs={12} md={6}>
          <Form.Group controlId="max_hp">
            <Form.Label css={labelStyle}>Max HP</Form.Label>
            <Form.Control
              type="number"
              placeholder="Max HP"
              name="max_hp"
              value={formData.max_hp}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>

          <Form.Group controlId="current_hp">
            <Form.Label css={labelStyle}>Current HP</Form.Label>
            <Form.Control
              type="number"
              placeholder="Current HP"
              name="current_hp"
              value={formData.current_hp}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>

          <Form.Group controlId="focus_points">
            <Form.Label css={labelStyle}>Focus Points</Form.Label>
            <Form.Control
              type="number"
              placeholder="Focus Points"
              name="focus_points"
              value={formData.focus_points}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>

          <Form.Group controlId="soul_rank">
            <Form.Label css={labelStyle}>Soul Rank</Form.Label>
            <Form.Control
              type="number"
              placeholder="Soul Rank"
              name="soul_rank"
              value={formData.soul_rank}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>

          <Form.Group controlId="height">
            <Form.Label css={labelStyle}>Height</Form.Label>
            <Form.Control
              type="number"
              placeholder="Height"
              name="height"
              value={formData.height}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>

          <Form.Group controlId="age">
            <Form.Label css={labelStyle}>Age</Form.Label>
            <Form.Control
              type="number"
              placeholder="Age"
              name="age"
              value={formData.age}
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

export default CharacterFormPart1;
