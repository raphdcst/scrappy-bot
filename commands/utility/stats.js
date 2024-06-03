// const fetch = require("../../node_modules/node-fetch/src/index.js");
const { SlashCommandBuilder } = require("discord.js");
const pico = require("picocolors");
const fc = require("../../utilities/fetchCookie.js");
const vs = require("../../utilities/vintedSearch.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Check stats")
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
      content: `Waiting for stats of the provided id : ${providedId}`,
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
    async function postStats({ user, memberName }) {
      const parsedName = await parseName(memberName);
      const channelId = await checkChannel(parsedName);
      const channel = await interaction.guild.channels.fetch(channelId);

      function calculateOverallRating(pos, neg) {
        const totalReviews = pos + neg;

        if (totalReviews === 0) {
          return "Avis très défavorable";
        }

        // Calcul du score de satisfaction basé sur le ratio d'avis positifs
        const positiveRatio = pos / totalReviews;
        let satisfactionScore = positiveRatio * 100;

        // Ajustement du score en fonction du ratio d'avis positifs par rapport aux avis négatifs
        const positiveToNegativeRatio = pos / (neg + 1); // Ajout de 1 pour éviter la division par zéro
        satisfactionScore *= Math.log(positiveToNegativeRatio + 1); // Utilisation du logarithme pour accentuer les différences

        // Détermination de l'avis en fonction du score de satisfaction
        if (satisfactionScore < 40) {
          return "Avis très défavorable";
        } else if (satisfactionScore < 60) {
          return "Avis défavorable";
        } else if (satisfactionScore < 80) {
          return "Avis neutre";
        } else {
          return "Avis favorable";
        }
      }

      const userEmbed = {
        type: "rich",
        title: `Stats rendered for **${user.login}**`,
        color: 0xa917fd,
        timestamp: new Date().toISOString(),
        thumbnail: {
          url: user.photo?.thumbnails[3]?.url,
        },
        fields: [
          {
            name: "\u200b",
            value: `:dollar: **${user.item_count}** items for sell`,
            inline: true,
          },
          {
            name: "\u200b",
            value: `:yen: **${user.given_item_count}** items sold`,
            inline: true,
          },
          {
            name: "\u200b",
            value: `:euro: **${user.taken_item_count}** items purchased`,
            inline: true,
          },
          {
            name: "\u200b",
            value: `:chart_with_upwards_trend: **${user.positive_feedback_count}** positive feedbacks`,
            inline: true,
          },
          {
            name: "\u200b",
            value: `:chart_with_downwards_trend: **${user.negative_feedback_count}** negative feedbacks`,
            inline: true,
          },
          {
            name: "\u200b",
            value: `:bar_chart: **${user.feedback_reputation.toFixed(
              2
            )}** points of overall reputation`,
            inline: true,
          },
          {
            name: "\u200b",
            value: `:bar_chart: **${calculateOverallRating(
              user.positive_feedback_count,
              user.negative_feedback_count
            )}**`,
            inline: true,
          },
        ],
      };

      await channel.send({
        embeds: [userEmbed],
        //components: [components],
      });

      await interaction.editReply({
        content: `Stats for **${memberName}** sent in ${channel}`,
        ephemeral: true,
      });
    }

    // Parses the url for the fetch request
    function parseVintedURL(providedId) {
      const params = providedId;
      return `https://www.vinted.fr/api/v2/users/${params}?localize=false`;
    }

    //Process the fetch request
    async function processRequest(cookie) {
      const url = new URL(parseVintedURL(providedId));
      const data = (await vs.vintedSearch(url, cookie)) ?? { data: [] };

      const user = data.user;
      const memberName = user.login;

      await postStats({ user, memberName });
      console.log(pico.green(`${pico.gray("[stats.js]")} Stats rendered !`));
    }

    //Run the entire script and catch errors
    try {
      const cookie = await fc.fetchCookie();
      console.log(pico.green(`${pico.gray("[stats.js]")} Cookie founded`));
      console.log(
        pico.blue(
          `${pico.gray(
            "[stats.js]"
          )} Waiting for stats of the provided id : ${providedId}`
        )
      );
      await processRequest(cookie);
    } catch (err) {
      return console.error(
        pico.red(
          `${pico.gray(
            "[stats.js]"
          )} An error occured during the process : ${err}`
        )
      );
    }
  },
};
