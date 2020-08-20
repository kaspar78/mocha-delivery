const axios = require("axios");

const getPoem = async () => {
  let response;
  try {
    response = await axios.get("https://poetrydb.org/random");
  } catch (error) {
    console.log(`Error occurred, poem not retrieved: `, error);
  }

  const { author, title, lines } = response.data;

  const formattedLines = lines.join("\n");
  const formattedPoem = `\n${title}\nBy ${author}\n\n${formattedLines}`;

  return formattedPoem;
};

module.exports = getPoem;
