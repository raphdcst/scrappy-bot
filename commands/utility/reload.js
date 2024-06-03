const { SlashCommandBuilder } = require("discord.js");
const pico = require("picocolors");
//Reload a command
module.exports = {
  category: "utility",
  data: new SlashCommandBuilder()
    .setName("reload")
    .setDescription("Reloads a command.")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("The command to reload.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const commandName = interaction.options
      .getString("command", true)
      .toLowerCase();
    const command = interaction.client.commands.get(commandName);

    if (!command) {
      return interaction.reply({
        content: `There is no command with name ${commandName} !`,
        ephemeral: true,
      });
    }

    delete require.cache[require.resolve(`./${command.data.name}.js`)];

    try {
      interaction.client.commands.delete(command.data.name);
      const newCommand = require(`./${command.data.name}.js`);
      interaction.client.commands.set(newCommand.data.name, newCommand);
      await interaction.reply({
        content: `Command _${newCommand.data.name}_ was reloaded!`,
        ephemeral: true,
      });
      console.log(
        pico.cyan(
          `${pico.gray("[reload.js]")} The file ${pico.italic(
            newCommand.data.name
          )} was reloaded!`
        )
      );
    } catch (error) {
      console.error(
        pico.red(
          `${pico.gray(
            "[reload.js]"
          )} There was an error while reloading a command ${
            command.data.name
          } : \n ${error.message}`
        )
      );
      await interaction.reply({
        content: `There was an error while reloading a command _${command.data.name}_ : \n ${error.message}`,
        ephemeral: true,
      });
    }
  },
};
