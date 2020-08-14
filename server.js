const express = require("express");
const bodyParser = require("body-parser");
const MessagingResponse = require("twilio").twiml.MessagingResponse;

const generateHaiku = require("./haiku");
const server = express();

const PORT = 8686 || process.env.PORT;

let balance = 30.0;
const mochaPrices = {
  S: 3.48,
  M: 3.96,
  L: 4.45
};

server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

let orderBegun = false;
let storedSize = "";

server.post("/sms", (req, res) => {
  const twiml = new MessagingResponse();

  if (Object.keys(req.body).length === 0) {
    console.log("ERROR, NO MESSAGE");
  }

  const incomingText = req.body.Body.toString().toUpperCase();

  const expandedSize = {
    S: "Small",
    M: "Medium",
    L: "Large"
  };
  const unrecognizedMessage = () => {
    twiml.message(
      'Unrecognized message. Please send "MOCHA" or "HAIKU" to get started!'
    );
  };

  const endMessageChain = () => {
    storedSize = "";
    orderBegun = false;
  };

  const insufficientFunds = sizeText => {
    twiml.message(
      `There is not enough money left in your balance for a${
        sizeText ? " " + expandedSize[sizeText].toLowerCase() : ""
      } mocha! You can always request a haiku with "HAIKU", though!`
    );
    endMessageChain();
  };

  const orderMocha = sizeText => {
    sizeText = sizeText.toUpperCase();
    balance = roundOut(balance - mochaPrices[sizeText]);

    twiml.message(
      `${expandedSize[sizeText]} mocha ordered. Remaining balance: $${balance}. Now for some poetry to enjoy it with, just send "HAIKU"!`
    );

    twilioClient.messages.create({
      body: `Papa just ordered a mocha of size: ${sizeText}. He has $${balance} remaining.`,
      from: process.env.TWILIO_NUMBER,
      to: process.env.MY_NUMBER
    });

    endMessageChain();
  };

  const checkBalance = (sizeText, onError, onSuccess) => {
    const projectedBalance = roundOut(balance - mochaPrices[sizeText]);
    if (projectedBalance < 0) {
      onError(sizeText);
    } else {
      onSuccess(sizeText);
    }
  };

  if (incomingText === "MOCHA") {
    let sizeOptions = Object.keys(mochaPrices).filter(
      key => mochaPrices[key] < balance
    );

    if (sizeOptions.length === 0) {
      insufficientFunds();
    } else {
      sizeOptions = sizeOptions.join("/");
      twiml.message(`What size mocha would you like? (${sizeOptions}): `);
      orderBegun = true;
    }
  } else if (
    incomingText === "S" ||
    incomingText === "M" ||
    incomingText === "L"
  ) {
    if (orderBegun) {
      checkBalance(incomingText, insufficientFunds, orderMocha);
    } else {
      storedSize = incomingText;
      orderBegun = true;

      checkBalance(storedSize, insufficientFunds, () =>
        twiml.message(
          `Seems like you asked for a mocha size before beginning an order. Would you like to order a ${expandedSize[
            incomingText
          ].toLowerCase()} mocha anyway? (Y/N)`
        )
      );
    }
  } else if (incomingText === "HAIKU") {
    twiml.message(generateHaiku().join(" / "));
  } else if (incomingText === "Y") {
    if (orderBegun) {
      checkBalance(storedSize, insufficientFunds, orderMocha);
    } else {
      unrecognizedMessage();
    }
  } else if (incomingText === "N") {
    if (orderBegun) {
      twiml.message(
        'Ok, no mocha ordered. A "HAIKU" is always available, though!'
      );
      endMessageChain();
    } else {
      unrecognizedMessage();
    }
  } else {
    unrecognizedMessage();
  }

  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
});

server.listen(PORT, () => console.log("SERVER LISTENING ON PORT: ", PORT));

const roundOut = n => Math.round(n * 100) / 100;
