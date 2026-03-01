const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const ALLOWED_CHANNEL = "1477266217948676106";
const REVIEW_CHANNEL = "1477272551347589273";
const ROLE_ID = "1356343210787606559";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("contract")
    .setDescription("Submit contract information")
    .addStringOption(option =>
      option.setName("nume")
        .setDescription("Nume")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("prenume")
        .setDescription("Prenume")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("cnp")
        .setDescription("CNP")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("telefon")
        .setDescription("Număr de telefon")
        .setRequired(true))
    .addAttachmentOption(option =>
      option.setName("buletin")
        .setDescription("Poză buletin")
        .setRequired(true)),

  async execute(interaction) {

    if (interaction.channelId !== ALLOWED_CHANNEL) {
      return interaction.reply({
        content: "Poți folosi această comandă doar în canalul corect.",
        ephemeral: true
      });
    }

    const nume = interaction.options.getString("nume");
    const prenume = interaction.options.getString("prenume");
    const cnp = interaction.options.getString("cnp");
    const telefon = interaction.options.getString("telefon");
    const buletin = interaction.options.getAttachment("buletin");

    const reviewChannel = interaction.guild.channels.cache.get(REVIEW_CHANNEL);
    if (!reviewChannel) {
      return interaction.reply({ content: "Canalul de review nu există.", ephemeral: true });
    }

    const message = await reviewChannel.send({
      content:
        `📄 **Contract nou**\n\n` +
        `👤 User: <@${interaction.user.id}>\n` +
        `🆔 Discord ID: ${interaction.user.id}\n` +
        `Nume: ${nume}\n` +
        `Prenume: ${prenume}\n` +
        `CNP: ${cnp}\n` +
        `Telefon: ${telefon}\n` +
        `🖼 Buletin: ${buletin.url}`
    });

    await message.react("✅");

    await interaction.reply({
      content: "Contract trimis spre aprobare.",
      ephemeral: true
    });

    const filter = (reaction, user) =>
      reaction.emoji.name === "✅" && !user.bot;

    const collector = message.createReactionCollector({
      filter,
      max: 1
    });

    collector.on("collect", async () => {
      try {
        const member = await interaction.guild.members.fetch(interaction.user.id);

        await member.roles.add(ROLE_ID);
        await member.setNickname(cnp);

        reviewChannel.send(`✅ Contract aprobat pentru <@${interaction.user.id}>`);
      } catch (err) {
        console.error(err);
      }
    });
  }
};
