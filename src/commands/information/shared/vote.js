const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const { EMBED_COLORS, SUPPORT_SERVER, DASHBOARD } = require("@root/config");

module.exports = (client) => {
  const embed = new MessageEmbed()
    .setAuthor({ name: "Vote" })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(client.user.displayAvatarURL())
    .setDescription("Hey there! Thanks for considering to Vote me\n[To vote me click here](https://top.gg/bot/897690618048942121)");

  // Buttons
  let components = [];
  components.push(new MessageButton().setLabel("Vote").setURL("https://top.gg/bot/897690618048942121").setStyle("LINK"));

  

  let buttonsRow = new MessageActionRow().addComponents(components);
  return { embeds: [embed], components: [buttonsRow] };
};
