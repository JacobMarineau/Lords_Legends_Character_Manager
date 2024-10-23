export const SAVE_CHARACTER_PART1 = "SAVE_CHARACTER_PART1";
export const SAVE_CHARACTER_PART2 = "SAVE_CHARACTER_PART2";
export const SAVE_CHARACTER_PART3 = "SAVE_CHARACTER_PART3";
export const UPDATE_RACE_AND_VOCATION = "UPDATE_RACE_AND_VOCATION";
export const RESET_CHARACTER_CREATION = "RESET_CHARACTER_CREATION";
export const SET_SELECTED_CHARACTER = "SET_SELECTED_CHARACTER";

// Action to save part 1 of the character form
export const saveCharacterPart1 = (formData) => ({
  type: SAVE_CHARACTER_PART1,
  payload: formData,
});

// Action to save part 2 of the character form
export const saveCharacterPart2 = (formData) => ({
  type: SAVE_CHARACTER_PART2,
  payload: formData,
});

// Action to save part 3 of the character form
export const saveCharacterPart3 = (formData) => ({
  type: SAVE_CHARACTER_PART3,
  payload: formData,
});

// Action to update race and vocation
export const updateRaceAndVocation = (race, vocation) => ({
  type: UPDATE_RACE_AND_VOCATION,
  payload: { race, vocation },
});

// Action to reset character creation
export const resetCharacterCreation = () => ({
  type: RESET_CHARACTER_CREATION,
});

// Action to set selected character
export const setSelectedCharacter = (characterId) => ({
  type: SET_SELECTED_CHARACTER,
  payload: characterId,
});
