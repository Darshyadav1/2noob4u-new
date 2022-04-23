const { Command } = require("@src/structures");
const { Message, CommandInteraction } = require("discord.js");
const amount = require('random-number')
const meth = Math.floor(Math.random() * 100);
const encouragements = ["1","2","3","4","5","6","7","8","9","10","69","70","100","101","99","87"]
const options = {
    min: 1,
    max: 100,
    integer: true
}

module.exports = class RoastCommand extends Command {
  constructor(client) {
    super(client, {
      name: "simprate",
      description: "rate",
      category: "FUN",
      command: {
        enabled: true,
        
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
    message.channel.send("You are" + encouragement + "% simp")
  }

  
}

