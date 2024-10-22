/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { css } from '@emotion/react';
import { useTheme } from '@emotion/react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveCharacterPart1 } from '../../redux/actions/characterActions';
import { updateRaceAndVocation } from '../../redux/actions/characterActions';
import races from '../../../server/data/races.json';
import vocations from '../../../server/data/vocations.json';


const CharacterFormPart1 = () => {
    const dispatch = useDispatch();
  const theme = useTheme();
  const history = useHistory(); 

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

  const buttonStyle = css`
    background-color: ${theme.colors.baseColor};
    border-color: ${theme.colors.baseColor};
    margin-top: 20px;
    padding: 10px 20px;
    font-size: 18px;
    &:hover {
      background-color: ${theme.colors.baseColor2};
      border-color: ${theme.colors.baseColor2};
    }
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

  const [vocationData, setVocationData] = useState(null);
  const [raceData, setRaceData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  console.log("Vocation Data:", vocationData);
console.log("Race Data:", raceData);

  const handleSubmit = () => {
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
    
    dispatch(saveCharacterPart1(formData));
    history.push("/characterstats2");
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
        <Col md={6}>
          <Form.Group controlId="name">
            <Form.Control
              type="text"
              placeholder="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="specialty">
            <Form.Control
              type="text"
              placeholder="Specialty"
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="max_hp">
            <Form.Control
              type="number"
              placeholder="HP"
              name="max_hp"
              value={formData.max_hp}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="current_ar">
            <Form.Control
              type="number"
              placeholder="AR"
              name="current_ar"
              value={formData.current_ar}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={3}>
          <Form.Group controlId="current_thp">
            <Form.Control
              type="number"
              placeholder="THP"
              name="current_thp"
              value={formData.current_thp}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="current_os">
            <Form.Control
              type="number"
              placeholder="OS"
              name="current_os"
              value={formData.current_os}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="extended_willpower">
            <Form.Control
              type="number"
              placeholder="Extended Will"
              name="extended_willpower"
              value={formData.extended_willpower}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="innate_willpower">
            <Form.Control
              type="number"
              placeholder="Innate Will"
              name="innate_willpower"
              value={formData.innate_willpower}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="height">
            <Form.Control
              type="number"
              placeholder="Height"
              name="height"
              value={formData.height}
              onChange={handleChange}
              css={inputStyle}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="age">
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

      <Row>
      <Col md={6}>
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
          <Col md={6}>
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
        </Col>
      </Row>

      <Button css={buttonStyle} onClick={handleSubmit}>
        Submit
      </Button>
    </Form>
  );
};

export default CharacterFormPart1;
