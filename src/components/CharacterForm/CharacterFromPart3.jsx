/** @jsxImportSource @emotion/react */
import React from 'react';
import { useSelector } from 'react-redux';
import { Row, Col, Button } from 'react-bootstrap';
import { css } from '@emotion/react';
import { useTheme } from '@emotion/react';
import { useHistory } from 'react-router-dom';

const CharacterFormPart3 = ({ userId }) => {
  const theme = useTheme();
  const history = useHistory();

  const formStyle = css`
    background: ${theme.colors.baseColor};
    padding: ${theme.spacing.large};
    border-radius: 12px;
    box-shadow: 0px 4px 10px ${theme.colors.boxShadow};
    color: ${theme.colors.offWhiteBackground};
    max-width: 1200px;
    margin: 0 auto;
    margin-top: ${theme.spacing.xxlarge};
     text-shadow: ${theme.effects.textDropShadow};
  `;

  const cardStyle = css`
    background: ${theme.colors.baseColor2}; 
    padding: ${theme.spacing.medium};
    border-radius: 8px;
    box-shadow: 0px 4px 8px ${theme.colors.boxShadow};
    margin-bottom: ${theme.spacing.large};
     text-shadow: ${theme.effects.textDropShadow};
  `;

  const headerStyle = css`
    color: ${theme.colors.highContrastTextLight};
    font-size: ${theme.typography.sizes.large};
    font-weight: ${theme.typography.weights.bold};
    margin-bottom: ${theme.spacing.medium};
     text-shadow: ${theme.effects.textDropShadow};
  `;

  const buttonStyle = css`
    background-color: ${theme.colors.baseColor2};
    border-color: ${theme.colors.baseColor};
    margin-top: ${theme.spacing.large};
    padding: ${theme.spacing.small} ${theme.spacing.medium};
    font-size: ${theme.typography.sizes.large};
     text-shadow: ${theme.effects.textDropShadow};
    &:hover {
      background-color: ${theme.colors.trim};
      border-color: ${theme.colors.trim};
    }
  `;

  const charismaTitleStyle = css`color: ${theme.colors.charismaGroup};`;
  const strengthTitleStyle = css`color: ${theme.colors.strengthGroup};`;
  const dexterityTitleStyle = css`color: ${theme.colors.dexterityGroup};`;
  const intelligenceTitleStyle = css`color: ${theme.colors.intelligenceGroup};`;
  const vitalityTitleStyle = css`color: ${theme.colors.vitalityGroup};`;
  const willpowerTitleStyle = css`color: ${theme.colors.willpowerGroup};`;
  const arcanaTitleStyle = css`color: ${theme.colors.arcanaGroup};`;
  const ferocityTitleStyle = css`color: ${theme.colors.ferocityGroup};`;

  const { part1, part2, race, vocation } = useSelector((state) => state.character);

  const characterData = {
    ...part1,
    ...part2,
    race: race || '',
    vocation: vocation || '',
  };

  const formData = {
    ...part1,
    ...part2,
    race: race || '',
    vocation: vocation || '',
  };

  const handleSubmit = async () => {
    
    // Build the final character object to match the backend structure
    const finalCharacterData = {
        name: formData.name,
        race: formData.race.name,   
        vocation: formData.vocation.name,  
        specialty: formData.specialty || 'N/A',
        max_hp: formData.max_hp || 0,
        current_hp: formData.current_hp || 0,
        focus_points: formData.focus_points || 0,
        soul_rank: formData.soul_rank || 0,
        speed_class: formData.speed_class || 0,
        height: formData.height || 0,
        age: formData.age || 0,
        glint_pieces: formData.glint_pieces || 0,
        current_thp: formData.current_thp || 0,
        current_ar: formData.current_ar || 0,
        current_os: formData.current_os || 0,
        current_mr: formData.current_mr || 0,
        innate_willpower: formData.innate_willpower || 0,
        extended_willpower: formData.extended_willpower || 0,
        strength: formData.strength || 0,
        dexterity: formData.dexterity || 0,
        intelligence: formData.intelligence || 0,
        charisma: formData.charisma || 0,
        vitality: formData.vitality || 0,
        arcana: formData.arcana || 0,
        ferocity: formData.ferocity || 0,
        persuasion: formData.persuasion || 0,
        deception: formData.deception || 0,
        bargaining: formData.bargaining || 0,
        performance: formData.performance || 0,
        charm: formData.charm || 0,
        acrobatics: formData.acrobatics || 0,
        athletics: formData.athletics || 0,
        agility: formData.agility || 0,
        lifting: formData.lifting || 0,
        sleight_of_hand: formData.sleight_of_hand || 0,
        stealth: formData.stealth || 0,
        medicine: formData.medicine || 0,
        weapon_mastery: formData.weapon_mastery || 0,
        carving: formData.carving || 0,
        history: formData.history || 0,
        wisdom: formData.wisdom || 0,
        science: formData.science || 0,
        technology: formData.technology || 0,
        foraging: formData.foraging || 0,
        endurance: formData.endurance || 0,
        resistance: formData.resistance || 0,
        feat_of_heroism: formData.feat_of_heroism || 0,
        leadership: formData.leadership || 0,
        counter_charisma: formData.counter_charisma || 0,
        magical_knowledge: formData.magical_knowledge || 0,
        intimidation: formData.intimidation || 0,
        magic_save_modifier: formData.magic_save_modifier || 0,
        physical_save_modifier: formData.physical_save_modifier || 0,
      };
      
      console.log('Final character data being sent:', finalCharacterData);
      
  
    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalCharacterData),
      });
  
      if (response.ok) {
        console.log('Character created successfully');
        history.push(`/character-summary/${userId}`);
      } else {
        console.error('Error submitting character data');
      }
    } catch (error) {
      console.error('API error:', error);
    }
  };
  

  return (
    <div css={formStyle}>
      <h3 css={headerStyle}>Review Your Character</h3>
      
      <div css={cardStyle}>
        <h4 css={headerStyle}>Basic Information</h4>
        <p><strong>Name:</strong> {characterData.name}</p>
        <p><strong>Race:</strong> {characterData.race.name || 'N/A'}</p>  
        <p><strong>Vocation:</strong> {characterData.vocation.name || 'N/A'}</p>  
        <p><strong>Specialty:</strong> {characterData.specialty}</p>
      </div>

      <div css={cardStyle}>
        <h4 css={headerStyle}>Health & Stats</h4>
        <p><strong>Max HP:</strong> {characterData.max_hp}</p>
        <p><strong>Current HP:</strong> {characterData.current_hp}</p>
        <p><strong>Focus Points:</strong> {characterData.focus_points}</p>
        <p><strong>Soul Rank:</strong> {characterData.soul_rank}</p>
        <p><strong>Speed Class:</strong> {characterData.speed_class}</p>
      </div>

      <div css={cardStyle}>
        <h4 css={headerStyle}>Major Stats</h4>
        <p><strong>Strength:</strong> {characterData.strength}</p>
        <p><strong>Dexterity:</strong> {characterData.dexterity}</p>
        <p><strong>Intelligence:</strong> {characterData.intelligence}</p>
        <p><strong>Charisma:</strong> {characterData.charisma}</p>
        <p><strong>Vitality:</strong> {characterData.vitality}</p>
        <p><strong>Willpower:</strong> {characterData.willpower}</p>
        <p><strong>Arcana:</strong> {characterData.arcana}</p>
        <p><strong>Ferocity:</strong> {characterData.ferocity}</p>
      </div>

      <div css={cardStyle}>
        <h4 css={headerStyle}>Minor Stats (Grouped by Major)</h4>
        <h5 css={charismaTitleStyle}><strong>Charisma Minor Stats</strong></h5>
        <p><strong>Persuasion:</strong> {characterData.persuasion}</p>
        <p><strong>Deception:</strong> {characterData.deception}</p>
        <p><strong>Bargaining:</strong> {characterData.bargaining}</p>
        <p><strong>Performance:</strong> {characterData.performance}</p>
        <p><strong>Charm:</strong> {characterData.charm}</p>

        <h5 css={strengthTitleStyle}><strong>Strength Minor Stats</strong></h5>
        <p><strong>Acrobatics:</strong> {characterData.acrobatics}</p>
        <p><strong>Athletics:</strong> {characterData.athletics}</p>
        <p><strong>Agility:</strong> {characterData.agility}</p>
        <p><strong>Lifting:</strong> {characterData.lifting}</p>

        <h5 css={dexterityTitleStyle}><strong>Dexterity Minor Stats</strong></h5>
        <p><strong>Sleight of Hand:</strong> {characterData.sleight_of_hand}</p>
        <p><strong>Stealth:</strong> {characterData.stealth}</p>
        <p><strong>Medicine:</strong> {characterData.medicine}</p>
        <p><strong>Weapon Mastery:</strong> {characterData.weapon_mastery}</p>
        <p><strong>Carving:</strong> {characterData.carving}</p>

        <h5 css={intelligenceTitleStyle}><strong>Intelligence Minor Stats</strong></h5>
        <p><strong>History:</strong> {characterData.history}</p>
        <p><strong>Wisdom:</strong> {characterData.wisdom}</p>
        <p><strong>Science:</strong> {characterData.science}</p>
        <p><strong>Technology:</strong> {characterData.technology}</p>
        <p><strong>Foraging:</strong> {characterData.foraging}</p>

        <h5 css={vitalityTitleStyle}><strong>Vitality Minor Stats</strong></h5>
        <p><strong>Endurance:</strong> {characterData.endurance}</p>
        <p><strong>Resistance:</strong> {characterData.resistance}</p>

        <h5 css={willpowerTitleStyle}><strong>Willpower Minor Stats</strong></h5>
        <p><strong>Feat of Heroism:</strong> {characterData.feat_of_heroism}</p>
        <p><strong>Leadership:</strong> {characterData.leadership}</p>
        <p><strong>Counter Charisma:</strong> {characterData.counter_charisma}</p>

        <h5 css={arcanaTitleStyle}><strong>Arcana Minor Stats</strong></h5>
        <p><strong>Magical Knowledge:</strong> {characterData.magical_knowledge}</p>
        <p><strong>Magic Save Modifier:</strong> {characterData.magic_save_modifier}</p>

        <h5 css={ferocityTitleStyle}><strong>Ferocity Minor Stats</strong></h5>
        <p><strong>Intimidation:</strong> {characterData.intimidation}</p>
        <p><strong>Physical Save Modifier:</strong> {characterData.physical_save_modifier}</p>
      </div>

      <Button css={buttonStyle} onClick={handleSubmit}>
        Submit Character
      </Button>
    </div>
  );
};

export default CharacterFormPart3;
