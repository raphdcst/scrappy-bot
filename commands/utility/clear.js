const { SlashCommandBuilder } = require("discord.js");
const pico = require("picocolors");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Delete a certain number of messages in a certain channel.")
    .addChannelOption(
      (option) =>
        option
          .setName("channel")
          .setDescription("The channel where deleting messages.")
      //  Delete messages in the current channel if the user doesn't provide a channel.
    )
    .addNumberOption(
      (option) =>
        option
          .setName("number")
          .setDescription("The number of messages to delete.")
      //Delete all the messages if the user doesn't provide a number.
    ),

  async execute(interaction) {
    const channel =
      interaction.options.getChannel("channel") ?? interaction.channel;

    const numberOfMessages = interaction.options.getNumber("number") ?? 100;

    try {
      await channel.bulkDelete(numberOfMessages, [true]);
      await interaction.reply({
        content: `Deleting **${numberOfMessages}** messages in ${channel}.`,
        ephemeral: true,
      });
    } catch (err) {
      console.error(
        pico.red(
          `${pico.gray(
            "[clear.js]"
          )} An error occured while clearing channel : ${err}`
        )
      );
      await interaction.reply({
        content: `An error occured while clearing channel : ${err}`,
        ephemeral: true,
      });
    }
  },
};
