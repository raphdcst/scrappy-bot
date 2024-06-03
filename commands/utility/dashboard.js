const { Client } = require("discord.js");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dashboard")
    .setDescription("Sends the embed dashboard")
    .addChannelOption(
      (option) =>
        option
          .setName("channel")
          .setDescription("The channel where the dashboard must be sent.")
          .setRequired(true)
      //  Delete messages in the current channel if the user doesn't provide a channel.
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");

    const dashboardEmbed = {
      color: 0x0099ff,
      title: ":computer: **Admin Dashboard**",
      description: "The easiest way to control Scrappy Doo !!",
      timestamp: new Date().toISOString(),
      footer: {
        text: "Sent by Scrappy Doo",
      },
    };

    const config = new ButtonBuilder()
			.setCustomId('config')
			.setLabel('⚙ Configurer')
			.setStyle(ButtonStyle.Success);

		const dressing = new ButtonBuilder()
			.setCustomId('dressing')
			.setLabel('👕 Accéder au dressing')
			.setStyle(ButtonStyle.Primary);

		const dashboardComponents = new ActionRowBuilder()
			.addComponents(config, dressing);

    try {
      await channel.send({ embeds: [dashboardEmbed], components: [dashboardComponents] });
      await interaction.reply({
        content: `The dashboard embed has been sent in ${channel}`,
        ephemeral: true,
      });
    } catch (err) {
      return interaction.reply({
        content: `An error occured : ${err}`,
        ephemeral: true,
      });
    }
  },
};
