const express = require("express");
const pool = require("../modules/pool");
const router = express.Router();
const {
  rejectUnauthenticated,
} = require("../modules/authentication-middleware");

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
        STRING_AGG(DISTINCT ms.stat_name || ': ' || ms.value, ', ') AS micro_stats,
        STRING_AGG(DISTINCT lang.language_name, ', ') AS languages,
        STRING_AGG(DISTINCT sp.spell_name || ' (' || COALESCE(sp.damage_die, 'N/A') || ')', ', ') AS spells,
        STRING_AGG(DISTINCT w.weapon_name || ' (' || COALESCE(w.damage_die, 'N/A') || ')', ', ') AS weapons,
        STRING_AGG(DISTINCT eq.name || ' (' || COALESCE(eq.type, 'N/A') || ')', ', ') AS equipment,
        STRING_AGG(DISTINCT sk.skill_name || ' (' || COALESCE(sk.damage_die, 'N/A') || ')', ', ') AS skills
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
      SELECT sk.skill_name, sk.damage_die, sk.description, sk.action_type, sk.cost
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
      SELECT e.name, e.type, e.description
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

const vocations = {
  wanderer: {
    weaponry: [
      {
        weapon_name: "Butterfly Swords",
        weapon_description: "Small dual-wielded swords",
        weapon_damage: "1d4 + Dex * 2 SL",
      },
      {
        weapon_name: "Art",
        weapon_description: "Small low-ranged rail gun",
        weapon_damage: "1d6 PR 50ft",
      },
    ],
    equipment: [
      "Backpack/Satchel",
      "Cloth shirt",
      "Fur-lined leather armor (1 AR)",
      "Steel-toed boots",
      "Simple pants",
      "100ft Rope",
      "Small cape",
      "Flute",
      "1 Small medical kit (Medicine + 10)",
      "1 Sewing kit",
      "Fire kit",
      "Knoll watch",
      "5 Lockpicks",
      "233.5 Glint",
      "20 Art pellets",
    ],
    skills: [
      {
        skill_name: "Dual Welding [Dex]",
        description: "You can dually wield Dex weapons you are proficient in.",
      },
      {
        skill_name: "Close Snipe",
        description:
          "Shooting an enemy within 10ft always results in a headshot.",
      },
    ],
    languages: ["Native", "Madorian", "Novorian", "+ two of player's choice"],
    minor_stats: {
      medicine: 2,
      performance: 2,
      athletics: 2,
      foraging_carving: 2,
    },
    micro_stats: [
      { micro_name: "Light Armor", stat: null },
      { micro_name: "Butterfly Swords", stat: null },
      { micro_name: "Arts", stat: null },
      { micro_name: "Flute", stat: null },
    ],
  },
};

/**
 * POST route template
 */
// ====== ROUTER CHARACTER POST ======
router.post("/", rejectUnauthenticated, async (req, res) => {
  const user_id = req.user.id;
  const {
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
  } = req.body;

  try {
    const characterQuery = `
      INSERT INTO characters (
        user_id, name, race, vocation, specialty, max_hp, current_hp, focus_points, soul_rank, speed_class, 
        height, age, glint_pieces, current_thp, current_ar, current_os, current_mr, innate_willpower, 
        extended_willpower, strength, dexterity, intelligence, charisma, vitality, arcana, ferocity, persuasion, 
        deception, bargaining, performance, charm, acrobatics, athletics, agility, lifting, sleight_of_hand, 
        stealth, medicine, weapon_mastery, carving, history, wisdom, science, technology, foraging, endurance, 
        resistance, feat_of_heroism, leadership, counter_charisma, magical_knowledge, intimidation
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, 
        $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, 
        $43, $44, $45, $46, $47, $48, $49, $50, $51, $52
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
    ]);

    const characterId = characterResult.rows[0].id;
    const vocationData = vocations[vocation];

    console.log("Inserting weapons:", vocationData.weaponry);
    console.log("Inserting equipment:", vocationData.equipment);
    console.log("Inserting skills:", vocationData.skills);

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
        INSERT INTO equipment (character_id, name)
        VALUES ($1, $2);
      `;
      await pool.query(equipmentQuery, [characterId, equipmentItem]);
    }

    // Insert skills
    for (const skill of vocationData.skills) {
      const skillQuery = `
        INSERT INTO skills (character_id, skill_name, description)
        VALUES ($1, $2, $3);
      `;
      await pool.query(skillQuery, [
        characterId,
        skill.skill_name,
        skill.description,
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

module.exports = router;
