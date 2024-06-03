// const fetch = require("../../node_modules/node-fetch/src/index.js");
const { SlashCommandBuilder } = require("discord.js");
const pico = require("picocolors");
const fc = require("../../utilities/fetchCookie.js");
const vs = require("../../utilities/vintedSearch.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dressing")
    .setDescription("Check dressing")
    .addIntegerOption((option) =>
      option
        .setName("id")
        .setDescription("The user id of the wanted dressing.")
        .setRequired(true)
    ),

  async execute(interaction) {
    //Parse user params from the slash command
    const providedId = interaction.options.getInteger("id");

    //Send ephemeral reply during pending
    await interaction.reply({
      content: `Waiting for dressing of the provided id : ${providedId}`,
      ephemeral: true,
    });

    //Remove . _ " " from the member name
    function parseName(memberName) {
      const parsedName = memberName.replace(/[\.\_\s]/g, "-");

      return parsedName;
    }

    //Check if user's dressing has already been fetched
    async function checkChannel(parsedName) {
      const guildChannels = await interaction.guild.channels.fetch();
      const channel = guildChannels.find(
        (channel) => channel.name === parsedName
      );

      if (channel === undefined) {
        const channel = await interaction.guild.channels.create({
          name: parsedName,
        });
        return channel.id;
      } else {
        return channel.id;
      }
    }

    //Post each founded items in an embed
    async function postArticles({ data, memberName }) {
      const parsedName = await parseName(memberName);
      const channelId = await checkChannel(parsedName);
      const channel = await interaction.guild.channels.fetch(channelId);

      //simultanously send the messages
      const messages = data.items.map((item) => {
        if (item.is_closed === 1) {
          const availability =
            item.is_closed === 0 ? ":white_check_mark:" : ":cross_mark:";

          const itemEmbed = {
            type: "rich",
            title: item.title,
            description: availability,
            color: 0xa917fd,
            fields: [
              {
                name: " ",
                value: `Prix : **${item.price.amount}** ${item.price.currency_code}`,
                inline: true,
              },
              {
                name: " ",
                value: `Taille : **${item.size}**`,
                inline: true,
              },
              {
                name: " ",
                value: `Marque : **${item.brand}**`,
                inline: true,
              },
            ],
            footer: {
              text: item.user?.login,
              icon_url: item.user?.photo?.thumbnails[4]?.url,
            },
            image: {
              url: item.photos[0]?.url,
            },
            url: item.url,
          };

          const components = {
            type: 1,
            components: [
              {
                style: 5,
                label: "Détails",
                url: item.url,
                disabled: false,
                type: 2,
              },
              {
                style: 5,
                label: "Envoyer un message",
                url: `https://www.vinted.fr/items/${item.id}/want_it/new?`,
                disabled: false,
                type: 2,
              },
              {
                style: 5,
                label: "Acheter",
                url: `https://www.vinted.fr/api/v2/transactions/${item.id}/checkout`,
                disabled: false,
                type: 2,
              },
            ],
          };

          return channel.send({
            embeds: [itemEmbed],
            components: [components],
          });
        }
      });

      await Promise.all(messages);

      await interaction.editReply({
        content: `Items sent in ${channel}`,
        ephemeral: true,
      });
    }

    // Parses the url for the fetch request
    function parseVintedURL(providedId) {
      const params = providedId;
      return `https://www.vinted.fr/api/v2/users/${params}/items`;
    }

    //Process the fetch request
    async function processRequest(cookie) {
      const url = new URL(parseVintedURL(providedId));
      const data = (await vs.vintedSearch(url, cookie)) ?? { data: [] };

      const articles = data.items;
      const memberName = data.items[0].user?.login;

      if (articles.lenght === 0) {
        console.log(
          pico.red(
            `${pico.gray(
              "[dressing.js]"
            )} There's no items in the dressing of the provided id : ${providedId}`
          )
        );
        await interaction.editReply(
          `There's no items in the dressing of the provided id : ${providedId}`
        );
      } else {
        await postArticles({ data, memberName });
      }
    }

    //Run the entire script and catch errors
    try {
      const cookie = await fc.fetchCookie();
      console.log(pico.green(`${pico.gray("[dressing.js]")} Cookie founded`));
      console.log(
        pico.blue(
          `${pico.gray(
            "[dressing.js]"
          )} Searching for items in the dressing of the provided id : ${providedId}`
        )
      );
      await processRequest(cookie);

      console.log(
        pico.green(
          `${pico.gray(
            "[dressing.js]"
          )} Items founded for the provided id : ${providedId}`
        )
      );
    } catch (err) {
      return console.error(
        pico.red(
          `${pico.gray(
            "[dressing.js]"
          )} An error occured during the process : ${err}`
        )
      );
    }
  },
};
