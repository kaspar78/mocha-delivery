const axios = require("axios");

const getPoem = async () => {
  let data;

  // Request poems 100 at a time and search for poems with less than 30 lines
  while (true) {
    const response = await axios.get("https://poetrydb.org/random/10");

    let chosenPoem = {};
    for (let poem of response.data) {
      if (poem.linecount <= 30) {
        chosenPoem = poem;
        break;
      }
    }

    if (Object.keys(chosenPoem) !== 0) {
      data = chosenPoem;
      break;
    }
  }

  const formattedPoem = `\n${data.title}\nBy ${
    data.author
  }\n\n${data.lines.join("\n")}`;

  return formattedPoem;
};

module.exports = getPoem;
