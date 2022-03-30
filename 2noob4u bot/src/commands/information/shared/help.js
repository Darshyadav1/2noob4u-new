const { MessageEmbed, MessageButton, MessageActionRow, Guild } = require("discord.js");
const { EMBED_COLORS, SUPPORT_SERVER, DASHBOARD } = require("@root/config");


module.exports = (client) => {
  const embed = new MessageEmbed()
    .setAuthor({ name: "Help have arrived!!" })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(client.user.displayAvatarURL())
    .setDescription(`Hey there! This is 2noob4u bot,a multipurpose discord bot which can serve all your needs \n [**You can find list of all cmds here**](https://dashboard.mrdarsh.repl.co/) \n \n __**Important links**__  \n [Vote for bot(top.gg)](https://top.gg/bot/897690618048942121) \n [Dashboard](https://2noob4u.up.railway.app/) \n [Support server](https://discord.com/invite/5PzGGTHjfb) \n \n __**Get 2noob4u**__ \n [Addbot(recommended)](https://discord.com/oauth2/authorize?client_id=897690618048942121&scope=bot+applications.commands&permissions=275380301174) \n [Add bot(Admin perms)](https://discord.com/oauth2/authorize?client_id=897690618048942121&permissions=8&scope=bot)`);

  // Buttons
  let components = [];
  components.push(new MessageButton().setLabel("Invite Link").setURL(client.getInvite()).setStyle("LINK"));
  components.push(new MessageButton().setLabel("Commands list").setURL("https://dashboard.mrdarsh.repl.co/").setStyle("LINK"));

  if (SUPPORT_SERVER) {
    components.push(new MessageButton().setLabel("Support Server").setURL(SUPPORT_SERVER).setStyle("LINK"));
  }

  if (DASHBOARD.enabled) {
    components.push(new MessageButton().setLabel("Dashboard Link").setURL(DASHBOARD.baseURL).setStyle("LINK"));
  }

  let buttonsRow = new MessageActionRow().addComponents(components);
  return { embeds: [embed], components: [buttonsRow] };
};
