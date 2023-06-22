var express = require("express");
var router = express.Router();
const fs = require("fs");
const pokemonTypes = require("../pokemonTypes");

/* GET home page. */
router.get("/", function (req, res, next) {
  //input validation
  const allowedFilter = ["page", "limit", "search", "type"];
  try {
    let { page, limit, ...filterQuery } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    //allow title,limit and page query string only
    const filterKeys = Object.keys(filterQuery);

    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key)) {
        const exception = new Error(`Query ${key} is not allowed`);
        exception.statusCode = 401;
        throw exception;
      }
      if (!filterQuery[key]) delete filterQuery[key];
    });
    //processing logic

    //Number of items skip for selection
    let offset = limit * (page - 1);

    //Read data from pokemons.json then parse to JSobject
    let db = fs.readFileSync("pokemons.json", "utf-8");
    db = JSON.parse(db);
    const { data } = db;

    //Filter data by title
    let result = [];

    // Logic filter data by search and by type
    if (filterKeys.length) {
      if (filterQuery.type) {
        result = result.length
          ? result.filter(
              (pokemon) =>
                pokemon.types[0] === filterQuery.type ||
                pokemon.types[1] === filterQuery
            )
          : data.filter(
              (pokemon) =>
                pokemon.types[0] === filterQuery.type ||
                pokemon.types[1] === filterQuery
            );
      }
      if (filterQuery.search) {
        result = result.length
          ? result.filter((pokemon) => pokemon.name === filterQuery.search)
          : data.filter((pokemon) => pokemon.name === filterQuery.search);
      }
    } else {
      result = data;
    }
    //then select number of result by offset
    result = result.slice(offset, offset + limit);
    //send response
    res.status(200).send({ data: result });
  } catch (error) {
    next(error);
  }
});
router.get("/:pokemonId", (req, res, next) => {
  try {
    let { pokemonId } = req.params;
    let nextPokemonId;
    let previousPokemonId;
    pokemonId = parseInt(pokemonId);
    //let arrayPokemonId = [];
    if (pokemonId === 1) {
      nextPokemonId = pokemonId + 1;
      previousPokemonId = 721;
    } else if (pokemonId === 721) {
      nextPokemonId = 1;
      previousPokemonId = pokemonId - 1;
    } else {
      nextPokemonId = pokemonId + 1;
      previousPokemonId = pokemonId - 1;
    }
    //processing logic

    //Read data from pokemons.json then parse to JSobject
    let db = fs.readFileSync("pokemons.json", "utf-8");
    db = JSON.parse(db);
    const { data } = db;
    //filter data by params
    let result = {};
    let previousPokemon = data.filter(
      (pokemon) => parseInt(pokemon.id) === previousPokemonId
    )[0];
    let pokemon = data.filter(
      (pokemon) => parseInt(pokemon.id) === pokemonId
    )[0];
    let nextPokemon = data.filter(
      (pokemon) => parseInt(pokemon.id) === nextPokemonId
    )[0];

    result.previousPokemon = previousPokemon;
    result.pokemon = pokemon;
    result.nextPokemon = nextPokemon;
    // response
    res.status(200).send({ data: result });
  } catch (error) {
    next(error);
  }
});
router.post("/", (req, res, next) => {
  try {
    const {
      name,
      types,
      url,
      id,
      description,
      category,
      abilities,
      height,
      weight,
    } = req.body;
    // handle  error
    if (!name || !types.length || !url || !id) {
      const exception = new Error(`Missing required data`);
      exception.statusCode = 401;
      throw exception;
    }
    // validate types
    if (types.length > 2) {
      const exception = new Error(`Pokémon can only have one or two types.`);
      exception.statusCode = 401;
      throw exception;
    }

    for (let i = 0; i < types.length; i++) {
      if (!pokemonTypes.includes(types[i])) {
        const exception = new Error(`Pokémon's type is invalid.`);
        exception.statusCode = 401;
        throw exception;
      }
    }
    //Read data from pokemons.json then parse to JSobject
    let db = fs.readFileSync("pokemons.json", "utf-8");
    db = JSON.parse(db);
    const { data } = db;
    // filter name and id
    let arrayName = data.map((pokemon) => pokemon.name);
    arrayName = new Set(arrayName);
    arrayName = Array.from(arrayName);
    let arrayId = data.map((pokemon) => pokemon.id);
    arrayId = new Set(arrayId);
    arrayId = Array.from(arrayId);

    let checkName = Boolean(arrayName.find((e) => e === name));
    let checkId = Boolean(arrayId.find((e) => e === id));

    if (checkName || checkId) {
      const exception = new Error(`The Pokémon already exists`);
      exception.statusCode = 401;
      throw exception;
    }
    //post processing
    const newPokemon = {
      id,
      name,
      types,
      url,
      description: description || "",
      height: height || "",
      weight: weight || "",
      category: category || "",
      abilities: abilities || "",
    };
    data.push(newPokemon);
    db.data = data;
    db.totalPokemons++;
    db = JSON.stringify(db);
    fs.writeFileSync("pokemons.json", db);
    //response
    res.status(200).send("done");
  } catch (error) {
    next(error);
  }
});
router.delete("/:pokemonId", (req, res, next) => {
  //delete input validation
  try {
    const { pokemonId } = req.params;
    //delete processing
    //Read data from pokemons.json then parse to JSobject
    let db = fs.readFileSync("pokemons.json", "utf-8");
    db = JSON.parse(db);
    const { data } = db;
    //find pokemon by id
    const targetIndex = data.findIndex((pokemon) => pokemon.id === pokemonId);
    if (targetIndex < 0) {
      const exception = new Error(`Pokemon not found`);
      exception.statusCode = 404;
      throw exception;
    }
    //filter db pokemonsobject
    db.data = data.filter((pokemon) => pokemon.id !== pokemonId);
    db.totalPokemons--;
    //db JSobject to JSON string

    db = JSON.stringify(db);
    //write and save to pokemon.json

    fs.writeFileSync("pokemons.json", db);
    //delete send response
    res.status(200).send({});
  } catch (error) {
    next(error);
  }
});
router.put("/:pokemonId", (req, res, next) => {
  try {
    const allowUpdate = [
      "name",
      "types",
      "url",
      "description",
      "height",
      "weight",
      "category",
      "abilities",
    ];
    const { pokemonId } = req.params;
    // validate input
    const updates = req.body;
    
    const updateKeys = Object.keys(updates);
    //find update request that not allow
    const notAllow = updateKeys.filter((el) => !allowUpdate.includes(el));
    if (notAllow.length) {
      const exception = new Error(`Update field not allow`);
      exception.statusCode = 401;
      throw exception;
    }
    //Read data from pokemon.json then parse to JSobject
    let db = fs.readFileSync("pokemons.json", "utf-8");
    db = JSON.parse(db);
    const { data } = db;
    // validate name
    const { name, types } = req.body;
   
    let arrayName = data.map((pokemon) => pokemon.name);
    //console.log(arrayName, "text") array cac name

    let getNameByPokemonId = data.filter((pokemon) => pokemon.id === pokemonId);
    let nameBypokemonId = getNameByPokemonId[0].name;

    if (name !== nameBypokemonId) {
      let checkName = Boolean(arrayName.find((e) => name === e));
      if (checkName) {
        const exception = new Error(`The Pokémon's name already exists`);
        exception.statusCode = 401;
        throw exception;
      }
    }
    // validate types
    if (types.length === 0) {
      const exception = new Error(`Missing required types`);
      exception.statusCode = 401;
      throw exception;
    }
    if (types.length > 2) {
      const exception = new Error(`Pokémon can only have one or two types.`);
      exception.statusCode = 401;
      throw exception;
    }

    for (let i = 0; i < types.length; i++) {
      if (!pokemonTypes.includes(types[i])) {
        const exception = new Error(`Pokémon's type is invalid.`);
        exception.statusCode = 401;
        throw exception;
      }
    }
    //find pokemon by id
    const targetIndex = data.findIndex(
      (pokemon) => pokemon.id === pokemonId
    );
    if (targetIndex < 0) {
      const exception = new Error(`Pokemon not found`);
      exception.statusCode = 404;
      throw exception;
    }
    //Update new content to db pokemon JS object
    const updatedPokemon = { ...db.data[targetIndex], ...updates };
    db.data[targetIndex] = updatedPokemon;

    //db JSobject to JSON string

    db = JSON.stringify(db);
    //write and save to pokemons.json
    fs.writeFileSync("pokemons.json", db);
    

    //put send response
    res.status(200).send(updatedPokemon);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
