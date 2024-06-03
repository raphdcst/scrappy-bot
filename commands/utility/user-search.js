const UserAgent = require("user-agents");
const { SlashCommandBuilder, codeBlock } = require("discord.js");
const pico = require("picocolors");
const fc = require("../../utilities/fetchCookie.js");
const vs = require("../../utilities/vintedSearch.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("user-search")
    .setDescription("Search user by name and return their id")
    .addStringOption((option) =>
      option
        .setName("user")
        .setDescription("The name of the wanted user.")
        .setRequired(true)
    ),

  async execute(interaction) {
    //Parse user params from the slash command
    const providedName = interaction.options.getString("user");
    const currentChannel = interaction.channel;

    //Reply during pending
    await interaction.reply({
      content: `Searching for **${providedName}** in the Vinted database...`,
      ephemeral: true,
    });

    //Post each founded items in an embed
    async function postUsers({ data, currentChannel }) {
      const users = data.users;

      //Prepare embed for each user
      const messages = users.map((user) => {
        const userEmbed = {
          type: "rich",
          title: `User founded : **${user.login}**`,
          description: codeBlock(user.id),
          color: 0xa917fd,
          timestamp: new Date().toISOString(),
          thumbnail: {
            url: user.photo?.thumbnails[3]?.url,
          },
          footer: {
            text: interaction.user.globalName,
            icon_url: interaction.user.avatarURL(),
          },
        };

        return currentChannel.send({
          embeds: [userEmbed],
          ephemeral: true,
        });
      });
      //send all the messages
      await Promise.all(messages);
    }

    //Prepares the url for the fetch request
    function parseVintedURL(providedName) {
      const params = providedName;
      return `https://www.vinted.fr/api/v2/users?page=1&per_page=36&search_text=${params}`;
    }

    //Process the fetch request
    async function processRequest(cookie) {
      const url = new URL(parseVintedURL(providedName));
      const data = (await vs.vintedSearch(url, cookie)) ?? { data: [] };

      const users = data.users;

      if (users.lenght === 0) {
        console.log(
          pico.red(
            `${pico.gray(
              "[user-search.js]"
            )} No matching users founded for ${providedName}`
          )
        );
        await interaction.editReply({
          content: `No matching users founded for ${providedName}`,
          ephemeral: true,
        });
      } else {
        await postUsers({ data, currentChannel });
        console.log(
          pico.green(
            `${pico.gray(
              "[user-search.js]"
            )} Matching users founded for ${providedName}`
          )
        );
        await interaction.editReply({
          content: "Matching users founded !",
          ephemeral: true,
        });
      }
    }

    //Run the entire script and catch errors
    try {
      const cookie = await fc.fetchCookie();
      console.log(
        pico.blue(
          `${pico.gray(
            "[user-search.js]"
          )} Searching for ${providedName} in the Vinted database...`
        )
      );
      await processRequest(cookie);
    } catch (err) {
      return console.error(
        pico.red(
          `${pico.gray(
            "[user-search.js]"
          )} An error occured during the process : ${err}`
        )
      );
    }
  },
};
