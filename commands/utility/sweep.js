const { SlashCommandBuilder } = require("discord.js");
const pico = require("picocolors");
const { PrismaClient } = require("@prisma/client");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sweep")
    .setDescription("Delete an item from monitoring")
    .addIntegerOption((option) =>
      option
        .setName("id")
        .setDescription("The id of item to delete.")
        .setRequired(true)
    ),

  async execute(interaction) {
    const providedId = interaction.options.getInteger("id");

    const prisma = new PrismaClient();

    try {
      await interaction.reply({
        content: `Sweeping item for the following id : ${providedId}...`,
        ephemeral: true,
      });

      await prisma.item.delete({
        where: {
          itemId: providedId,
        },
      });

      const guildChannels = await interaction.guild.channels.fetch();
      const channel = guildChannels.find(
        (channel) => channel.name.includes(providedId) === true
      );

      await channel.delete();

      await interaction.editReply({
        content: `Sweeped item for the following id : ${providedId} !`,
        ephemeral: true,
      });

      console.log(
        pico.green(
          `${pico.gray(
            "[sweep.js]"
          )}Deleted the following id from db and server : ${providedId}`
        )
      );
    } catch (err) {
      return console.error(
        pico.red(
          `${pico.gray(
            "[sweep.js]"
          )} An error occured during sweep for ${providedId} : ${err}`
        )
      );
    }
  },
};
