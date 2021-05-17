const { Wit } = require("node-wit");

class WitService {
  constructor(accessToken) {
    this.client = new Wit({ accessToken });
  }
  async query(text) {
    const queryResult = await this.client.message(text);
    const { intents } = queryResult;
    const { entities } = queryResult;

    const extractedIntents = {};
    const extractedEntitites = {};

    //lets unpack the query
    Object.keys(intents).forEach((key) => {
      extractedIntents[key] = intents[key];
    });
    Object.keys(entities).forEach((key) => {
      extractedEntitites[key] = entities[key][0];
    });
    //setup for a possible route the bot can return
    let route = "";
    let message = "";
    //take care of the intent first
    const intent = extractedIntents["0"].name;
    //greeting intent
    if (intent == "greeting") {
      console.log("greeting");
      message = this.greetingMessage;
      //console.log(this.greetingMessage);
      return message;
      //buy tshirt intent
    } else if (intent == "buy_tshirt") {
      console.log("buy_tshirt");
      if (extractedEntitites["color:color"] != null) {
        message += `${extractedEntitites["color:color"].body} `;
      }
      if (extractedEntitites["meme:meme"] != null) {
        message += `${extractedEntitites["meme:meme"].body} `;
      }
      if (extractedEntitites["product:product"] != null) {
        message += `${extractedEntitites["product:product"].body}`;
      }
      message += ". Lad mig se hvad jeg ka gøre.";
      if (message == "En ") {
        message =
          "Jeg forstod ikke din forespørgsel. Prøv at skriv det på en anden måde :)";
      }
      //console.log(message);
      route = "/products/tshirts";
      return message;
      //support intent
    } else if (intent == "support_tshirt") {
      console.log("support_tshirt");
      let message = "Du ønsker ";
      if (extractedEntitites["action:action"] != null) {
        message += `at ${extractedEntitites["action:action"].body} `;
        if (extractedEntitites["action:action"].body == "klage") {
          message += "over ";
        }
      } else {
        message += "support ";
      }
      if (extractedEntitites["product:product"] != null) {
        message += `${extractedEntitites["product:product"].body}`;
      } else {
        message += "en vare";
      }
      message += ". Jeg sender dig videre til vores serviceformular.";
      route = "/service/form";
      return message;
    }
    //console.log(Math.floor(Math.random() * 10 + 1));
    //console.log(this.greetingMessage);
    return message;
    //return extractedEntitites;
  }

  get greetingMessage() {
    const greetSeed = Math.floor(Math.random() * 5 + 1);
    let message = "";
    const messageSender = ", jeg er Nerdbot hvad ka jeg hjælpe med ?";
    switch (greetSeed) {
      case 1:
        message = "Davs";
        break;
      case 2:
        message = "Hey";
        break;
      case 3:
        message = "Hvad så";
        break;
      case 4:
        message = "Hejsa";
        break;
      default:
        message = "Hej";
        break;
    }
    return `${message}${messageSender}`;
  }
}

module.exports = WitService;
