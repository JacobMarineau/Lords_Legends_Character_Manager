import {
  SAVE_CHARACTER_PART1,
  SAVE_CHARACTER_PART2,
  SAVE_CHARACTER_PART3,
  UPDATE_RACE_AND_VOCATION,
  RESET_CHARACTER_CREATION,
} from "../actions/characterActions";

const initialState = {
  part1: {}, // First form data
  part2: {}, // Second form data
  part3: {}, // Third form data
  race: "",
  vocation: "",
};

const characterReducer = (state = initialState, action) => {
  switch (action.type) {
    case SAVE_CHARACTER_PART1:
      return {
        ...state,
        part1: action.payload, // Save form part 1
      };
    case SAVE_CHARACTER_PART2:
      return {
        ...state,
        part2: action.payload, // Save form part 2
      };
    case SAVE_CHARACTER_PART3:
      return {
        ...state,
        part3: action.payload, // Save form part 3
      };
    case UPDATE_RACE_AND_VOCATION: // Save and update the names and contents
      return {
        ...state,
        race: {
          name: action.payload.raceName,
          ...action.payload.race,
        },
        vocation: {
          name: action.payload.vocationName,
          ...action.payload.vocation,
        },
      };
    case RESET_CHARACTER_CREATION: // Reset
      return initialState;
    default:
      return state;
  }
};

export default characterReducer;
