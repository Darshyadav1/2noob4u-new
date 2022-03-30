const { Command } = require("@src/structures");
const { Message, MessageEmbed, MessageButton } = require("discord.js");
const help = require("../shared/help");

module.exports = class BotInvite extends Command {
  constructor(client) {
    super(client, {
      name: "help",
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
    const response = help(message.client);
    try {
      await message.author.send(response);
      return message.react("<a:2noobsuccess:953996497807081562>");
    } catch (ex) {await message.channel.send(response);
    }
    
    }
   
};
