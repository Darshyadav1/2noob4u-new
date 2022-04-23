const { Command } = require("@src/structures");
const { Message, CommandInteraction } = require("discord.js");
const encouragements = ["1","2","3","4","5","6","7","8","9","10"]
const { target } = require("@utils/modUtils");
const response = target;


module.exports = class RoastCommand extends Command {
  constructor(client) {
    super(client, {
      name: "rate",
      description: "rate",
      category: "FUN",
      command: {
        enabled: true,
        usage: "<Thing>",
        minArgsCount: 1,
      },
      slashCommand: {
        enabled: false,
        ephemeral: true,
        options: [],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)]
    message.channel.send("I would rate it a " + encouragement + " out of 10")
  }

  
}

