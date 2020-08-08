const express = require("express");
const bodyParser = require("body-parser");
const MessagingResponse = require("twilio").twiml.MessagingResponse;

const generateHaiku = require("./haiku");
const server = express();

const PORT = 8686 || process.env.PORT;

let balance = 30.0;
const mochaPrices = {
  S: 3.47,
  M: 3.96,
  L: 4.45
};

server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

server.post("/sms", (req, res) => {
  const twiml = new MessagingResponse();

  if (Object.keys(req.body).length === 0) {
    console.log("ERROR, NO MESSAGE");
  }

  const incomingText = req.body.Body.toString();

  if (incomingText === "MOCHA") {
    let sizeOptions = ["S", "M", "L"].filter(key => mochaPrices[key] < balance);

    if (sizeOptions.length === 0) {
      twiml.message(
        'There is not enough money left in your balance for a mocha! You can always request a haiku with "HAIKU", though!'
      );
    } else {
      sizeOptions = sizeOptions.join("/");
      twiml.message(`What size mocha would you like? (${sizeOptions}): `);
    }
  } else if (
    incomingText === "S" ||
    incomingText === "M" ||
    incomingText === "L"
  ) {
    const newBalance = roundOut(balance - mochaPrices[incomingText]);
    if (newBalance < 0) {
      twiml.message(
        'There is not enough money left in your balance for a mocha! You can always request a haiku with "HAIKU", though!'
      );
    } else {
      const expandedSize = {
        S: "Small",
        M: "Medium",
        L: "Large"
      };
      balance = newBalance;
      let message = `${expandedSize[incomingText]} Mocha ordered. Remaining balance: $${balance}. Now for some poetry to enjoy it with, just send "HAIKU"!`;
      twiml.message(message);
    }
  } else if (incomingText === "HAIKU") {
    twiml.message(generateHaiku().join(" / "));
  } else {
    twiml.message(
      'Unrecognized message. Please send "MOCHA" or "HAIKU" and follow the instructions!'
    );
  }

  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
});

server.listen(PORT, () => console.log("SERVER LISTENING ON PORT: ", PORT));

const roundOut = n => Math.round(n * 100) / 100;
