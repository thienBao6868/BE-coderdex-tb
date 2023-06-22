const fs = require("fs");
const csv = require("csvtojson");
const faker = require("@faker-js/faker");
/**
 * generating data
 * input recevie
 * check input
 * process data
 * save data
 */
const createDataPokemon = async (quantity) => {
  let QUANYITY = parseInt(quantity)
  let newData = await csv().fromFile("pokemon.csv");
  newData = newData.slice(0, QUANYITY);

  let data = JSON.parse(fs.readFileSync("pokemons.json"));

  const category = ["category1","category2","category3","category4","category5","category6","category7","category8","category9"]
  
  for (let i = 0; i < QUANYITY; i++) {
    let types =[]
    if(newData[i].Type2){
      types = [newData[i].Type1.toLowerCase(), newData[i].Type2.toLowerCase()]
    }else{
      types = [newData[i].Type1.toLowerCase()]
    }
    
    newData[i] = {
      id: `${i + 1}`,
      name: newData[i].Name,
      types: types,
      url: `http://localhost:5500/images/${i + 1}.png`,
      description: faker.faker.string.alpha(20),
      height:`${faker.faker.number.int({ min: 100, max: 120 })}cm`,
      weight: `${faker.faker.number.int({ min: 40, max: 60 })}kg`,
      category: `${category[Math.floor(Math.random() * 8)]}`,
      abilities: faker.faker.string.alpha(15),
    };
  }
  data.data = newData;
  data.totalPokemons = QUANYITY;
  
  fs.writeFileSync("pokemons.json", JSON.stringify(data));
  console.log("done");
};
const inputQuantityPokemons = process.argv.slice(2)[0]
createDataPokemon(inputQuantityPokemons);
