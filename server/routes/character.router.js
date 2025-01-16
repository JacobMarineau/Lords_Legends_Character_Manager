const express = require("express");
const pool = require("../modules/pool");
const router = express.Router();
const {
  rejectUnauthenticated,
} = require("../modules/authentication-middleware");
const races = require("../data/races.json");
const vocations = require("../data/vocations.json");

// ====== ROUTER GET CHARACTERS BY USER ID ======
router.get("/user/:user_id", async (req, res) => {
  const userId = req.params.user_id;
  try {
    const query = `
      SELECT
        c.id AS character_id,
        c.name AS character_name,
        c.race,
        c.vocation,
        c.specialty,
        c.max_hp,
        c.current_hp,
        c.focus_points,
        c.soul_rank,
        c.speed_class,
        c.height,
        c.age,
        c.glint_pieces,
        c.current_thp,
        c.current_ar,
        c.current_os,
        c.current_mr,
        c.innate_willpower,
        c.extended_willpower,
        c.strength,
        c.dexterity,
        c.intelligence,
        c.charisma,
        c.vitality,
        c.arcana,
        c.ferocity,
        c.persuasion,
        c.deception,
        c.bargaining,
        c.performance,
        c.charm,
        c.acrobatics,
        c.athletics,
        c.agility,
        c.lifting,
        c.sleight_of_hand,
        c.stealth,
        c.medicine,
        c.weapon_mastery,
        c.carving,
        c.history,
        c.wisdom,
        c.science,
        c.technology,
        c.foraging,
        c.endurance,
        c.resistance,
        c.feat_of_heroism,
        c.leadership,
        c.counter_charisma,
        c.magical_knowledge,
        c.intimidation,
        c.magic_save_modifier,
        c.physical_save_modifier,
        -- Aggregated data from related tables
        STRING_AGG(DISTINCT ms.stat_name || ': ' || COALESCE(ms.value::TEXT, 'N/A'), ', ') AS micro_stats,
        STRING_AGG(DISTINCT lang.language_name, ', ') AS languages,
        STRING_AGG(DISTINCT sp.spell_name || ' (' || COALESCE(sp.damage_die, 'N/A') || ', ' || COALESCE(sp.cost, 'N/A') || ', ' || COALESCE(sp.action_type, 'N/A') || ')', ', ') AS spells,
        STRING_AGG(DISTINCT w.weapon_name || ' (' || COALESCE(w.damage_die, 'N/A') || ', ' || COALESCE(w.description, 'N/A') || ')', ', ') AS weapons,
        STRING_AGG(DISTINCT eq.name || ' (' || COALESCE(eq.type, 'N/A') || ', ' || COALESCE(eq.description, 'N/A') || ')', ', ') AS equipment,
        STRING_AGG(DISTINCT sk.skill_name || ' (' || COALESCE(sk.description, 'N/A') || ', ' || COALESCE(sk.action_type, 'N/A') || ', ' || COALESCE(sk.damage_die, 'N/A') || ', ' || COALESCE(sk.cost, 'N/A') || ')', ', ') AS skills
      FROM characters c
      LEFT JOIN micro_stats ms ON c.id = ms.character_id
      LEFT JOIN languages lang ON c.id = lang.character_id
      LEFT JOIN spells sp ON c.id = sp.character_id
      LEFT JOIN weapons w ON c.id = w.character_id
      LEFT JOIN equipment eq ON c.id = eq.character_id
      LEFT JOIN skills sk ON c.id = sk.character_id
      WHERE c.user_id = $1
      GROUP BY c.id;
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No characters found for this user." });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching characters for user:", error);
    res.status(500).send("Error fetching characters");
  }
});

// ====== ROUTER CHARACTER GET ======
router.get("/", async (req, res) => {
  try {
    const query = `SELECT * FROM characters;`;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching characters:", error);
    res.status(500).send("Error fetching characters");
  }
});

// ====== ROUTER CHARACTER:ID GET ======
router.get("/:id", async (req, res) => {
  const characterId = req.params.id;
  try {
    const query = `
      SELECT
          c.id AS character_id,
          c.name AS character_name,
          c.race,
          c.vocation,
          c.specialty,
          c.max_hp,
          c.current_hp,
          c.focus_points,
          c.soul_rank,
          c.speed_class,
          c.height,
          c.age,
          c.glint_pieces,
          c.current_thp,
          c.current_ar,
          c.current_os,
          c.current_mr,
          c.innate_willpower,
          c.extended_willpower,
          c.strength,
          c.dexterity,
          c.intelligence,
          c.charisma,
          c.vitality,
          c.arcana,
          c.ferocity,
          c.persuasion,
          c.deception,
          c.bargaining,
          c.performance,
          c.charm,
          c.acrobatics,
          c.athletics,
          c.agility,
          c.lifting,
          c.sleight_of_hand,
          c.stealth,
          c.medicine,
          c.weapon_mastery,
          c.carving,
          c.history,
          c.wisdom,
          c.science,
          c.technology,
          c.foraging,
          c.endurance,
          c.resistance,
          c.feat_of_heroism,
          c.leadership,
          c.counter_charisma,
          c.magical_knowledge,
          c.intimidation,
          -- Use JSON_AGG to return these as JSON arrays
          JSON_AGG(DISTINCT jsonb_build_object('stat_name', ms.stat_name, 'value', COALESCE(ms.value, 0))) AS micro_stats,
          JSON_AGG(DISTINCT lang.language_name) AS languages,
          JSON_AGG(DISTINCT jsonb_build_object('spell_name', sp.spell_name, 'damage_die', sp.damage_die, 'cost', sp.cost, 'action_type', sp.action_type)) AS spells,
          JSON_AGG(DISTINCT jsonb_build_object('weapon_name', w.weapon_name, 'damage_die', w.damage_die, 'description', w.description)) AS weapons,
          JSON_AGG(DISTINCT jsonb_build_object('name', eq.name, 'type', eq.type, 'description', eq.description)) AS equipment,
          JSON_AGG(DISTINCT jsonb_build_object('id', sk.id, 'skill_name', sk.skill_name, 'description', sk.description, 'action_type', sk.action_type, 'damage_die', sk.damage_die, 'cost', sk.cost)) AS skills
      FROM characters c
      LEFT JOIN micro_stats ms ON c.id = ms.character_id
      LEFT JOIN languages lang ON c.id = lang.character_id
      LEFT JOIN spells sp ON c.id = sp.character_id
      LEFT JOIN weapons w ON c.id = w.character_id
      LEFT JOIN equipment eq ON c.id = eq.character_id
      LEFT JOIN skills sk ON c.id = sk.character_id
      WHERE c.id = $1
      GROUP BY c.id;
    `;

    const result = await pool.query(query, [characterId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Character not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching character by ID:", error);
    res.status(500).send("Error fetching character");
  }
});

// ====== ROUTER CHARACTER:ID SPELLS GET ======
router.get("/:id/spells", async (req, res) => {
  const characterId = req.params.id;
  try {
    const query = `
          SELECT sp.spell_name, sp.damage_die, sp.cost, sp.description, sp.action_type
          FROM spells sp
          WHERE sp.character_id = $1;
      `;
    const result = await pool.query(query, [characterId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching spells for character:", error);
    res.status(500).send("Error fetching spells");
  }
});

// ====== ROUTER CHARACTER:ID WEAPONS GET ======
router.get("/:id/weapons", async (req, res) => {
  const characterId = req.params.id;
  try {
    const query = `
      SELECT w.weapon_name, w.damage_die, w.description
      FROM weapons w
      WHERE w.character_id = $1;
    `;
    const result = await pool.query(query, [characterId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching weapons for character:", error);
    res.status(500).send("Error fetching weapons");
  }
});

// ====== ROUTER CHARACTER:ID SKILLS GET ======
router.get("/:id/skills", async (req, res) => {
  const characterId = req.params.id;
  try {
    const query = `
      SELECT sk.id, sk.skill_name, sk.damage_die, sk.description, sk.action_type, sk.cost
      FROM skills sk
      WHERE sk.character_id = $1;
    `;
    const result = await pool.query(query, [characterId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching skills for character:", error);
    res.status(500).send("Error fetching skills");
  }
});

// ====== ROUTER CHARACTER:ID EQUIPMENT GET ======
router.get("/:id/equipment", async (req, res) => {
  const characterId = req.params.id;
  try {
    const query = `
      SELECT id, e.name, e.type, e.description
      FROM equipment e
      WHERE e.character_id = $1;
    `;
    const result = await pool.query(query, [characterId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching equipment for character:", error);
    res.status(500).send("Error fetching equipment");
  }
});

// ====== ROUTER CHARACTER:ID LANGUAGES GET ======
router.get("/:id/languages", async (req, res) => {
  const characterId = req.params.id;
  try {
    const query = `
      SELECT l.language_name
      FROM languages l
      WHERE l.character_id = $1;
    `;
    const result = await pool.query(query, [characterId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching languages for character:", error);
    res.status(500).send("Error fetching languages");
  }
});

// ====== ROUTER CHARACTER:ID MICRO-STATS GET ======
router.get("/:id/micro-stats", async (req, res) => {
  const characterId = req.params.id;
  try {
    const query = `
      SELECT ms.stat_name, ms.value
      FROM micro_stats ms
      WHERE ms.character_id = $1;
    `;
    const result = await pool.query(query, [characterId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching micro stats for character:", error);
    res.status(500).send("Error fetching micro stats");
  }
});

/**
 * POST route template
 */
// ====== ROUTER CHARACTER POST ======
router.post("/", rejectUnauthenticated, async (req, res) => {
  const user_id = req.user.id;
  let {
    name,
    race,
    vocation,
    specialty,
    max_hp,
    current_hp,
    focus_points,
    soul_rank,
    speed_class,
    height,
    age,
    glint_pieces,
    current_thp,
    current_ar,
    current_os,
    current_mr,
    innate_willpower,
    extended_willpower,
    strength,
    dexterity,
    intelligence,
    charisma,
    vitality,
    arcana,
    ferocity,
    persuasion,
    deception,
    bargaining,
    performance,
    charm,
    acrobatics,
    athletics,
    agility,
    lifting,
    sleight_of_hand,
    stealth,
    medicine,
    weapon_mastery,
    carving,
    history,
    wisdom,
    science,
    technology,
    foraging,
    endurance,
    resistance,
    feat_of_heroism,
    leadership,
    counter_charisma,
    magical_knowledge,
    intimidation,
    magic_save_modifier,
    physical_save_modifier,
  } = req.body;

  console.log("Request Body:", req.body);

  const raceData = races[race.toLowerCase()];
  if (raceData) {
    charisma += raceData.modifiers.charisma || 0;
    strength += raceData.modifiers.strength || 0;
    dexterity += raceData.modifiers.dexterity || 0;
    intelligence += raceData.modifiers.intelligence || 0;
    vitality += raceData.modifiers.vitality || 0;
    innate_willpower += raceData.modifiers.innate_willpower || 0;
    arcana += raceData.modifiers.arcana || 0;
    ferocity += raceData.modifiers.ferocity || 0;
  }

  const vocationData = vocations[vocation.toLowerCase()];
  if (vocationData) {
    persuasion += vocationData.minor_stats.persuasion || 0;
    deception += vocationData.minor_stats.deception || 0;
    bargaining += vocationData.minor_stats.bargaining || 0;
    performance += vocationData.minor_stats.performance || 0;
    charm += vocationData.minor_stats.charm || 0;

    acrobatics += vocationData.minor_stats.acrobatics || 0;
    athletics += vocationData.minor_stats.athletics || 0;
    agility += vocationData.minor_stats.agility || 0;
    lifting += vocationData.minor_stats.lifting || 0;

    sleight_of_hand += vocationData.minor_stats.sleight_of_hand || 0;
    stealth += vocationData.minor_stats.stealth || 0;
    medicine += vocationData.minor_stats.medicine || 0;
    weapon_mastery += vocationData.minor_stats.weapon_mastery || 0;
    carving += vocationData.minor_stats.carving || 0;

    history += vocationData.minor_stats.history || 0;
    wisdom += vocationData.minor_stats.wisdom || 0;
    science += vocationData.minor_stats.science || 0;
    technology += vocationData.minor_stats.technology || 0;
    foraging += vocationData.minor_stats.foraging || 0;

    endurance += vocationData.minor_stats.endurance || 0;
    resistance += vocationData.minor_stats.resistance || 0;

    feat_of_heroism += vocationData.minor_stats.feat_of_heroism || 0;
    leadership += vocationData.minor_stats.leadership || 0;
    counter_charisma += vocationData.minor_stats.counter_charisma || 0;

    magical_knowledge += vocationData.minor_stats.magical_knowledge || 0;
    magic_save_modifier += vocationData.minor_stats.magic_save_modifier || 0;

    intimidation += vocationData.minor_stats.intimidation || 0;
    physical_save_modifier +=
      vocationData.minor_stats.physical_save_modifier || 0;
  }

  // ====== STAT CALCULATION FUNCTION ======

  function calculateMajorStatModifier(stat) {
    return Math.floor((stat - 10) / 2);
  }

  // ====== WILLPOWER, FEROCITY, ARCANA SINGLE SPEC FUNCTION ======

  function applySingleSpecStat(stat) {
    return stat;
  }

  // ====== UPDATE MINOR STATS BASED ON MAJOR STATS ======

  function updateMinorStats(character) {
    const updatedCharacter = { ...character };

    // ====== CHARISMA ======
    const charismaModifier = calculateMajorStatModifier(character.charisma);
    updatedCharacter.persuasion = character.persuasion + charismaModifier;
    updatedCharacter.deception = character.deception + charismaModifier;
    updatedCharacter.bargaining = character.bargaining + charismaModifier;
    updatedCharacter.performance = character.performance + charismaModifier;
    updatedCharacter.charm = character.charm + charismaModifier;

    // ====== STRENGTH ======
    const strengthModifier = calculateMajorStatModifier(character.strength);
    updatedCharacter.acrobatics = character.acrobatics + strengthModifier;
    updatedCharacter.athletics = character.athletics + strengthModifier;
    updatedCharacter.agility = character.agility + strengthModifier;
    updatedCharacter.lifting = character.lifting + strengthModifier;

    // ====== DEXTERITY ======
    const dexterityModifier = calculateMajorStatModifier(character.dexterity);
    updatedCharacter.sleight_of_hand =
      character.sleight_of_hand + dexterityModifier;
    updatedCharacter.stealth = character.stealth + dexterityModifier;
    updatedCharacter.medicine = character.medicine + dexterityModifier;
    updatedCharacter.weapon_mastery =
      character.weapon_mastery + dexterityModifier;
    updatedCharacter.carving = character.carving + dexterityModifier;

    // ====== INTELLIGENCE ======
    const intelligenceModifier = calculateMajorStatModifier(
      character.intelligence
    );
    updatedCharacter.history = character.history + intelligenceModifier;
    updatedCharacter.wisdom = character.wisdom + intelligenceModifier;
    updatedCharacter.science = character.science + intelligenceModifier;
    updatedCharacter.technology = character.technology + intelligenceModifier;
    updatedCharacter.foraging = character.foraging + intelligenceModifier;

    // ====== VITALITY ======
    const vitalityModifier = calculateMajorStatModifier(character.vitality);
    updatedCharacter.endurance = character.endurance + vitalityModifier;
    updatedCharacter.resistance = character.resistance + vitalityModifier;

    // ====== WILLPOWER ======
    updatedCharacter.feat_of_heroism =
      character.feat_of_heroism + applySingleSpecStat(character.willpower);
    updatedCharacter.leadership =
      character.leadership + applySingleSpecStat(character.willpower);
    updatedCharacter.counter_charisma =
      character.counter_charisma + applySingleSpecStat(character.willpower);

    // ====== ARCANA ======
    updatedCharacter.magical_knowledge =
      character.magical_knowledge + applySingleSpecStat(character.arcana);
    updatedCharacter.magic_save_modifier =
      character.magic_save_modifier + applySingleSpecStat(character.arcana);

    // ====== FEROCITY ======
    updatedCharacter.intimidation =
      character.intimidation + applySingleSpecStat(character.ferocity);
    updatedCharacter.physical_save_modifier =
      character.physical_save_modifier +
      applySingleSpecStat(character.ferocity);

    return updatedCharacter;
  }

  try {
    const characterQuery = `
      INSERT INTO characters (
        user_id, name, race, vocation, specialty, max_hp, current_hp, focus_points, soul_rank, speed_class, 
        height, age, glint_pieces, current_thp, current_ar, current_os, current_mr, innate_willpower, 
        extended_willpower, strength, dexterity, intelligence, charisma, vitality, arcana, ferocity, persuasion, 
        deception, bargaining, performance, charm, acrobatics, athletics, agility, lifting, sleight_of_hand, 
        stealth, medicine, weapon_mastery, carving, history, wisdom, science, technology, foraging, endurance, 
        resistance, feat_of_heroism, leadership, counter_charisma, magical_knowledge, intimidation, magic_save_modifier, physical_save_modifier
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, 
        $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, 
        $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54
      ) RETURNING id;
    `;
    const characterResult = await pool.query(characterQuery, [
      user_id,
      name,
      race,
      vocation,
      specialty,
      max_hp,
      current_hp,
      focus_points,
      soul_rank,
      speed_class,
      height,
      age,
      glint_pieces,
      current_thp,
      current_ar,
      current_os,
      current_mr,
      innate_willpower,
      extended_willpower,
      strength,
      dexterity,
      intelligence,
      charisma,
      vitality,
      arcana,
      ferocity,
      persuasion,
      deception,
      bargaining,
      performance,
      charm,
      acrobatics,
      athletics,
      agility,
      lifting,
      sleight_of_hand,
      stealth,
      medicine,
      weapon_mastery,
      carving,
      history,
      wisdom,
      science,
      technology,
      foraging,
      endurance,
      resistance,
      feat_of_heroism,
      leadership,
      counter_charisma,
      magical_knowledge,
      intimidation,
      magic_save_modifier,
      physical_save_modifier,
    ]);

    const characterId = characterResult.rows[0].id;

    console.log("Inserting weapons:", vocationData.weaponry);
    console.log("Inserting equipment:", vocationData.equipment);
    console.log("Inserting skills:", vocationData.skills);

    // ====== INSERT PASSIVES ======
    for (const passive of raceData.passives) {
      const skillQuery = `
        INSERT INTO skills (character_id, skill_name, description)
        VALUES ($1, $2, $3);
      `;
      await pool.query(skillQuery, [
        characterId,
        passive.skill_name,
        passive.description,
      ]);
    }

    // Insert weapons
    for (const weapon of vocationData.weaponry) {
      const weaponQuery = `
        INSERT INTO weapons (character_id, weapon_name, description, damage_die)
        VALUES ($1, $2, $3, $4);
      `;
      await pool.query(weaponQuery, [
        characterId,
        weapon.weapon_name,
        weapon.weapon_description,
        weapon.weapon_damage,
      ]);
    }

    // Insert equipment
    for (const equipmentItem of vocationData.equipment) {
      const equipmentQuery = `
        INSERT INTO equipment (character_id, name, description)
        VALUES ($1, $2, $3);
      `;
      await pool.query(equipmentQuery, [
        characterId,
        equipmentItem.name,
        equipmentItem.description,
      ]);
    }

    // Insert skills
    for (const skill of vocationData.skills) {
      const skillQuery = `
        INSERT INTO skills (character_id, skill_name, description, action_type, damage_die, cost)
        VALUES ($1, $2, $3, $4, $5, $6);
      `;
      await pool.query(skillQuery, [
        characterId,
        skill.skill_name,
        skill.description,
        skill.action_type,
        skill.damage_die,
        skill.cost,
      ]);
    }

    // Insert languages
    for (const language of vocationData.languages) {
      const languageQuery = `
        INSERT INTO languages (character_id, language_name)
        VALUES ($1, $2);
      `;
      await pool.query(languageQuery, [characterId, language]);
    }

    // ====== INSERT SPELLS ======
    for (const spell of vocationData.spells) {
      const spellQuery = `
      INSERT INTO spells (character_id, spell_name, damage_die, cost, action_type, description)
      VALUES ($1, $2, $3, $4, $5, $6)`;
      await pool.query(spellQuery, [
        characterId,
        spell.spell_name,
        spell.damage_die,
        spell.cost,
        spell.action_type,
        spell.description,
      ]);
    }

    // Insert micro stats
    for (const microStat of vocationData.micro_stats) {
      const microStatQuery = `
        INSERT INTO micro_stats (character_id, stat_name, value)
        VALUES ($1, $2, $3);
      `;
      await pool.query(microStatQuery, [
        characterId,
        microStat.micro_name,
        microStat.stat || 0,
      ]);
    }

    res.status(201).json({ character_id: characterId });
  } catch (error) {
    console.error(
      "Error creating character and inserting vocation data:",
      error
    );
    res.status(500).json({
      message: "Error creating character and inserting vocation data",
      error: error.message,
    });
  }
});

//=============================
//====== POSTS FOR SHEET ======
//=============================

// POST route to add a new weapon for a character
router.post("/:characterId/weapons", async (req, res) => {
  const { characterId } = req.params;
  const { weapon_name, damage_die, description } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO weapons (character_id, weapon_name, damage_die, description) VALUES ($1, $2, $3, $4) RETURNING *",
      [characterId, weapon_name, damage_die, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding weapon:", error);
    res.status(500).json({ error: "Failed to add weapon" });
  }
});

// POST route to add a new spell for a character
router.post("/:characterId/spells", async (req, res) => {
  const { characterId } = req.params;
  const { spell_name, damage_die, cost, action_type, description } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO spells (character_id, spell_name, damage_die, cost, action_type, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [characterId, spell_name, damage_die, cost, action_type, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding spell:", error);
    res.status(500).json({ error: "Failed to add spell" });
  }
});

// POST route to add a new skill for a character
router.post("/:characterId/skills", async (req, res) => {
  const { characterId } = req.params;
  const { skill_name, damage_die, description, action_type, cost } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO skills (character_id, skill_name, damage_die, description, action_type, cost) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [characterId, skill_name, damage_die, description, action_type, cost]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding skill:", error);
    res.status(500).json({ error: "Failed to add skill" });
  }
});

// POST route to add a new equipment item for a character
router.post("/:characterId/equipment", async (req, res) => {
  const characterId = req.params.characterId;
  const { name, type, description } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO equipment (character_id, name, type, description) VALUES ($1, $2, $3, $4) RETURNING *",
      [characterId, name, type, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding equipment:", error.message);
    res.status(500).json({ message: "Error adding equipment" });
  }
});

// POST route to add a new language for a character
router.post("/:characterId/languages", async (req, res) => {
  const { characterId } = req.params;
  const { language_name } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO languages (character_id, language_name) VALUES ($1, $2) RETURNING *",
      [characterId, language_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding language:", error);
    res.status(500).json({ error: "Failed to add language" });
  }
});

// Put for character stats
router.put("/:characterId", async (req, res) => {
  const characterId = req.params.characterId;
  const fieldsToUpdate = req.body;

  console.log("Received update request for character:", characterId);
  console.log("Request body:", fieldsToUpdate);

  let updateFields = [];
  let queryParams = [characterId];
  let parameterIndex = 2;

  Object.entries(fieldsToUpdate).forEach(([key, value]) => {
    if (value !== undefined) {
      updateFields.push(`${key} = $${parameterIndex}`);
      queryParams.push(value);
      parameterIndex += 1;
    }
  });

  if (updateFields.length === 0) {
    return res.status(400).send("No fields to update");
  }

  const query = `
    UPDATE characters SET ${updateFields.join(", ")}
    WHERE id = $1 RETURNING *;
  `;

  console.log("SQL Query:", query);
  console.log("Query Parameters:", queryParams);

  try {
    const result = await pool.query(query, queryParams);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Character not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating character:", error.message, error.stack);
    res.status(500).json({ message: "Error updating character" });
  }
});

// ===============
// === DELETES ===
// ===============

// ====== DELETE CHARACTER AND ASSOCIATED DATA ======
router.delete("/:id", async (req, res) => {
  const characterId = req.params.id;

  try {
    // Start a transaction
    await pool.query("BEGIN");

    // Delete associated spells
    await pool.query(`DELETE FROM spells WHERE character_id = $1`, [
      characterId,
    ]);

    // Delete associated weapons
    await pool.query(`DELETE FROM weapons WHERE character_id = $1`, [
      characterId,
    ]);

    // Delete associated skills
    await pool.query(`DELETE FROM skills WHERE character_id = $1`, [
      characterId,
    ]);

    // Delete associated equipment
    await pool.query(`DELETE FROM equipment WHERE character_id = $1`, [
      characterId,
    ]);

    // Delete associated languages
    await pool.query(`DELETE FROM languages WHERE character_id = $1`, [
      characterId,
    ]);

    // Delete associated micro_stats
    await pool.query(`DELETE FROM micro_stats WHERE character_id = $1`, [
      characterId,
    ]);

    // Finally, delete the character
    const result = await pool.query(
      `DELETE FROM characters WHERE id = $1 RETURNING *`,
      [characterId]
    );

    if (result.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ message: "Character not found" });
    }

    // Commit transaction
    await pool.query("COMMIT");

    res
      .status(200)
      .json({ message: "Character and associated data deleted successfully" });
  } catch (error) {
    // Rollback transaction in case of error
    await pool.query("ROLLBACK");
    console.error("Error deleting character and associated data:", error);
    res
      .status(500)
      .json({ message: "Error deleting character and associated data" });
  }
});

// ====== DELETE SPECIFIC SPELL BY SPELL ID ======
router.delete("/:character_id/spells/:spell_id", async (req, res) => {
  const { character_id, spell_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM spells WHERE character_id = $1 AND id = $2 RETURNING *`,
      [character_id, spell_id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Spell not found for this character" });
    }

    res.status(200).json({ message: "Spell deleted successfully" });
  } catch (error) {
    console.error("Error deleting spell:", error);
    res.status(500).json({ message: "Error deleting spell" });
  }
});

// ====== DELETE SPECIFIC WEAPON BY WEAPON ID ======
router.delete("/:character_id/weapons/:weapon_id", async (req, res) => {
  const { character_id, weapon_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM weapons WHERE character_id = $1 AND id = $2 RETURNING *`,
      [character_id, weapon_id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Weapon not found for this character" });
    }

    res.status(200).json({ message: "Weapon deleted successfully" });
  } catch (error) {
    console.error("Error deleting weapon:", error);
    res.status(500).json({ message: "Error deleting weapon" });
  }
});

// ====== DELETE SPECIFIC SKILL BY SKILL ID ======
router.delete("/:character_id/skills/:skill_id", async (req, res) => {
  const { character_id, skill_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM skills WHERE character_id = $1 AND id = $2 RETURNING *`,
      [character_id, skill_id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Skill not found for this character" });
    }

    res.status(200).json({ message: "Skill deleted successfully" });
  } catch (error) {
    console.error("Error deleting skill:", error);
    res.status(500).json({ message: "Error deleting skill" });
  }
});

// ====== DELETE SPECIFIC EQUIPMENT BY EQUIPMENT ID ======
router.delete("/:character_id/equipment/:equipment_id", async (req, res) => {
  const { character_id, equipment_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM equipment WHERE character_id = $1 AND id = $2 RETURNING *`,
      [character_id, equipment_id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Equipment not found for this character" });
    }

    res.status(200).json({ message: "Equipment deleted successfully" });
  } catch (error) {
    console.error("Error deleting equipment:", error);
    res.status(500).json({ message: "Error deleting equipment" });
  }
});

// ====== DELETE SPECIFIC LANGUAGE BY LANGUAGE ID ======
router.delete("/:character_id/languages/:language_id", async (req, res) => {
  const { character_id, language_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM languages WHERE character_id = $1 AND id = $2 RETURNING *`,
      [character_id, language_id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Language not found for this character" });
    }

    res.status(200).json({ message: "Language deleted successfully" });
  } catch (error) {
    console.error("Error deleting language:", error);
    res.status(500).json({ message: "Error deleting language" });
  }
});

// ====== DELETE SPECIFIC MICRO STAT BY MICRO STAT ID ======
router.delete("/:character_id/micro-stats/:micro_stat_id", async (req, res) => {
  const { character_id, micro_stat_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM micro_stats WHERE character_id = $1 AND id = $2 RETURNING *`,
      [character_id, micro_stat_id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Micro stat not found for this character" });
    }

    res.status(200).json({ message: "Micro stat deleted successfully" });
  } catch (error) {
    console.error("Error deleting micro stat:", error);
    res.status(500).json({ message: "Error deleting micro stat" });
  }
});

// ====== PUT /api/characters/:characterId/skills/:skillId ======
router.put("/:characterId/skills/:skillId", async (req, res) => {
  const { characterId, skillId } = req.params; // Get characterId and skillId from route parameters
  const { skill_name, damage_die, action_type, cost, description } = req.body; // Get new skill details from request body

  try {
    const query = `
      UPDATE skills
      SET 
        skill_name = COALESCE($1, skill_name),
        damage_die = COALESCE($2, damage_die),
        action_type = COALESCE($3, action_type),
        cost = COALESCE($4, cost),
        description = COALESCE($5, description)
      WHERE id = $6 AND character_id = $7
      RETURNING *;
    `;

    const values = [
      skill_name,
      damage_die,
      action_type,
      cost,
      description,
      skillId,
      characterId,
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Skill not found for this character." });
    }

    res.status(200).json({
      message: "Skill updated successfully.",
      skill: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating skill:", error);
    res.status(500).json({ message: "Error updating skill." });
  }
});

module.exports = router;
