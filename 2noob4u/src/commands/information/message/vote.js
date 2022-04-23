const { Command } = require("@src/structures");
const { Message } = require("discord.js");
const vote = require("../shared/vote");

module.exports = class BotInvite extends Command {
  constructor(client) {
    super(client, {
      name: "vote",
      description: "gives you bot invite",
      category: "INFORMATION",
      botPermissions: ["EMBED_LINKS"],
      command: {
        enabled: true,
      },
      slashCommand: {
        enabled: false,
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const response = vote(message.client);
    try {
      await message.channel.send(response);
      
    } catch (ex) {
      return  message.author.send("I cannot send you my information! Is your DM open?");
    }
  }
};
