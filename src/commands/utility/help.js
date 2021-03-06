const { Command, CommandCategory, BotClient } = require("@src/structures");
const { EMBED_COLORS, SUPPORT_SERVER } = require("@root/config.js");
const {
  MessageEmbed,
  MessageActionRow,
  MessageSelectMenu,
  Message,
  MessageButton,
  CommandInteraction,
} = require("discord.js");

const CMDS_PER_PAGE = 5;
const IDLE_TIMEOUT = 30;
const cache = {};

module.exports = class HelpCommand extends Command {
  constructor(client) {
    super(client, {
      name: "commands",
      description: "command help menu",
      category: "UTILITY",
      botPermissions: ["EMBED_LINKS"],
      command: {
        enabled: true,
        aliases: ["cmds","cmd","command"],
        usage: "[command]",
      },
      slashCommand: {
        enabled: true,
        options: [
          {
            name: "command",
            description: "name of the command",
            required: false,
            type: "STRING",
          },
        ],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   * @param {object} data
   */
  async messageRun(message, args, data) {
    let trigger = args[0];

    // !help
    if (!trigger) {
      if (cache[`${message.guildId}|${message.author.id}`]) {
        return message.safeReply("You are already viewing the help menu.");
      }
      const response = await getHelpMenu(message);
      const sentMsg = await message.safeReply(response);
      return waiter(sentMsg, message.author.id, data.prefix);
    }

    // check if command help (!help cat)
    const cmd = this.client.getCommand(trigger);
    if (cmd) return cmd.sendUsage(message.channel, data.prefix, trigger);

    // No matching command/category found
    await message.safeReply("No matching command found");
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    let cmdName = interaction.options.getString("command");

    // !help
    if (!cmdName) {
      if (cache[`${interaction.guildId}|${interaction.user.id}`]) {
        return interaction.followUp("You are already viewing the help menu.");
      }
      const response = await getHelpMenu(interaction);
      const sentMsg = await interaction.followUp(response);
      return waiter(sentMsg, interaction.user.id);
    }

    // check if command help (!help cat)
    const cmd = this.client.slashCommands.get(cmdName);
    if (cmd) {
      const embed = cmd.getSlashUsage();
      return interaction.followUp({ embeds: [embed] });
    }

    // No matching command/category found
    await interaction.followUp("No matching command found");
  }
};

/**
 * @param {CommandInteraction} interaction
 */
async function getHelpMenu({ client, guild }) {
  // Menu Row
  const options = [];
  const keys = Object.keys(CommandCategory);
  keys.forEach((key) => {
    const value = CommandCategory[key];
    const data = {
      label: value.name,
      value: key,
      description: `View commands in ${value.name} category`,
      emoji: value.emoji,
    };
    options.push(data);
  });

  const menuRow = new MessageActionRow().addComponents(
    new MessageSelectMenu().setCustomId("help-menu").setPlaceholder("2Noob4u help menu").addOptions(options)
  );

  // Buttons Row
  let components = [];
  components.push(
    new MessageButton().setCustomId("previousBtn").setEmoji("??????").setStyle("SECONDARY").setDisabled(true),
    new MessageButton().setCustomId("nextBtn").setEmoji("??????").setStyle("SECONDARY").setDisabled(true)
  );

  let buttonsRow = new MessageActionRow().addComponents(components);

  const embed = new MessageEmbed()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(client.user.displayAvatarURL())
    .setDescription(
      "**About Me:**\n" +
      `Hello I am ${guild.me.displayName}!\n` +
      "I have many features like \n" + "<a:2noobsuccess:937961849671016518>Auto mod \n <a:2noobsuccess:937961849671016518>Tickets \n <a:2noobsuccess:937961849671016518>Crystal clear music \n <a:2noobsuccess:937961849671016518>Invite tracker \n <a:2noobsuccess:937961849671016518>Giveaway \n <a:2noobsuccess:937961849671016518>Economy \n <a:2noobsuccess:937961849671016518>Many anime commands \n [I also have a dashboard](https://2noob4u.up.railway.app)  \n \n" +
      `__**Important links**__ \n [Vote for bot(top.gg)](https://top.gg/bot/897690618048942121) \n [Support server](https://discord.gg/5PzGGTHjfb) \n [Dashboard](https://2noob4u.up.railway.app) \n \n **__Get 2noob4u__** \n [Add bot (recommended)](${client.getInvite()}) \n [Add bot(Admin perms)](https://discord.com/oauth2/authorize?client_id=897690618048942121&permissions=8&scope=bot) \n \n` +
      `[To report any bug pls join support server <3](https://discord.gg/5PzGGTHjfb)`
    );

  return {
    embeds: [embed],
    components: [menuRow, buttonsRow],
  };
}

/**
 * @param {Message} msg
 * @param {string} userId
 * @param {string} prefix
 */
const waiter = (msg, userId, prefix) => {
  // Add to cache
  cache[`${msg.guildId}|${userId}`] = Date.now();

  const collector = msg.channel.createMessageComponentCollector({
    filter: (reactor) => reactor.user.id === userId,
    idle: IDLE_TIMEOUT * 1000,
    dispose: true,
    time: 5 * 60 * 1000,
  });

  let arrEmbeds = [];
  let currentPage = 0;
  let menuRow = msg.components[0];
  let buttonsRow = msg.components[1];

  collector.on("collect", async (response) => {
    if (!["help-menu", "previousBtn", "nextBtn"].includes(response.customId)) return;
    await response.deferUpdate();

    switch (response.customId) {
      case "help-menu": {
        const cat = response.values[0].toUpperCase();
        arrEmbeds = prefix ? getMsgCategoryEmbeds(msg.client, cat, prefix) : getSlashCategoryEmbeds(msg.client, cat);
        currentPage = 0;
        buttonsRow.components.forEach((button) => button.setDisabled(arrEmbeds.length > 1 ? false : true));
        msg.editable && (await msg.edit({ embeds: [arrEmbeds[currentPage]], components: [menuRow, buttonsRow] }));
        break;
      }

      case "previousBtn":
        if (currentPage !== 0) {
          --currentPage;
          msg.editable && (await msg.edit({ embeds: [arrEmbeds[currentPage]], components: [menuRow, buttonsRow] }));
        }
        break;

      case "nextBtn":
        if (currentPage < arrEmbeds.length - 1) {
          currentPage++;
          msg.editable && (await msg.edit({ embeds: [arrEmbeds[currentPage]], components: [menuRow, buttonsRow] }));
        }
        break;
    }
  });

  collector.on("end", () => {
    if (cache[`${msg.guildId}|${userId}`]) delete cache[`${msg.guildId}|${userId}`];
    if (!msg.guild || !msg.channel) return;
    return msg.editable && msg.edit({ components: [] });
  });
};

/**
 * Returns an array of message embeds for a particular command category [SLASH COMMANDS]
 * @param {BotClient} client
 * @param {string} category
 */
function getSlashCategoryEmbeds(client, category) {
  let collector = "";

  // For IMAGE Category
  if (category === "IMAGE") {
    client.slashCommands
      .filter((cmd) => cmd.category === category)
      .forEach((cmd) => (collector += `\`/${cmd.name}\`\n ??? ${cmd.description}\n\n`));

    const availableFilters = client.slashCommands
      .get("filter")
      .slashCommand.options[0].choices.map((ch) => ch.name)
      .join(", ");

    const availableGens = client.slashCommands
      .get("generator")
      .slashCommand.options[0].choices.map((ch) => ch.name)
      .join(", ");

    collector +=
      "**Available Filters:**\n" + `${availableFilters}` + `*\n\n**Available Generators**\n` + `${availableGens}`;

    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setThumbnail(CommandCategory[category]?.image)
      .setAuthor({ name: `${category} Commands` })
      .setDescription(collector);

    return [embed];
  }

  // For REMAINING Categories
  const commands = Array.from(client.slashCommands.filter((cmd) => cmd.category === category).values());

  if (commands.length === 0) {
    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setThumbnail(CommandCategory[category]?.image)
      .setAuthor({ name: `${category} Commands` })
      .setDescription("No commands in this category");

    return [embed];
  }

  const arrSplitted = [];
  const arrEmbeds = [];

  while (commands.length) {
    let toAdd = commands.splice(0, commands.length > CMDS_PER_PAGE ? CMDS_PER_PAGE : commands.length);

    toAdd = toAdd.map((cmd) => {
      const subCmds = cmd.slashCommand.options.filter((opt) => opt.type === "SUB_COMMAND");
      const subCmdsString = subCmds.map((s) => s.name).join(", ");

      return `\`/${cmd.name}\`\n ??? **Description**: ${cmd.description}\n ${
        subCmds == 0 ? "" : `??? **SubCommands [${subCmds.length}]**: ${subCmdsString}\n`
      } `;
    });

    arrSplitted.push(toAdd);
  }

  arrSplitted.forEach((item, index) => {
    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setThumbnail(CommandCategory[category]?.image)
      .setAuthor({ name: `${category} Commands` })
      .setDescription(item.join("\n"))
      .setFooter({ text: `page ${index + 1} of ${arrSplitted.length}` });
    arrEmbeds.push(embed);
  });

  return arrEmbeds;
}

/**
 * Returns an array of message embeds for a particular command category [MESSAGE COMMANDS]
 * @param {BotClient} client
 * @param {string} category
 * @param {string} prefix
 */
function getMsgCategoryEmbeds(client, category, prefix) {
  let collector = "";

  // For IMAGE Category
  if (category === "IMAGE") {
    client.commands
      .filter((cmd) => cmd.category === category)
      .forEach((cmd) =>
        cmd.command.aliases.forEach((alias) => {
          collector += `\`${alias}\`, `;
        })
      );

    collector +=
      "\n\nYou can use these image commands in following formats\n" +
      `**${prefix}cmd:** Picks message authors avatar as image\n` +
      `**${prefix}cmd <@member>:** Picks mentioned members avatar as image\n` +
      `**${prefix}cmd <url>:** Picks image from provided URL\n` +
      `**${prefix}cmd [attachment]:** Picks attachment image`;

    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setThumbnail(CommandCategory[category]?.image)
      .setAuthor({ name: `${category} Commands` })
      .setDescription(collector);

    return [embed];
  }

  // For REMAINING Categories
  const commands = client.commands.filter((cmd) => cmd.category === category);

  if (commands.length === 0) {
    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setThumbnail(CommandCategory[category]?.image)
      .setAuthor({ name: `${category} Commands` })
      .setDescription("No commands in this category");

    return [embed];
  }

  const arrSplitted = [];
  const arrEmbeds = [];

  while (commands.length) {
    let toAdd = commands.splice(0, commands.length > CMDS_PER_PAGE ? CMDS_PER_PAGE : commands.length);
    toAdd = toAdd.map((cmd) => `\`${prefix}${cmd.name}\`\n ??? ${cmd.description}\n`);
    arrSplitted.push(toAdd);
  }

  arrSplitted.forEach((item, index) => {
    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setThumbnail(CommandCategory[category]?.image)
      .setAuthor({ name: `${category} Commands` })
      .setDescription(item.join("\n"))
      .setFooter({
        text: `page ${index + 1} of ${arrSplitted.length} | Type ${prefix}cmd <command> for more command information`,
      });
    arrEmbeds.push(embed);
  });

  return arrEmbeds;
}
