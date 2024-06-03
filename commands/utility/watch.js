const { SlashCommandBuilder } = require("discord.js");
const pico = require("picocolors");
const fc = require("../../utilities/fetchCookie.js");
const vs = require("../../utilities/vintedSearch.js");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("watch")
    .setDescription("Start monitor for the specified item")
    .addIntegerOption((option) =>
      option
        .setName("id")
        .setDescription("The id of the wanted item.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("The url of the wanted item.")
        .setRequired(false)
    ),
  async execute(interaction) {
    const providedId = interaction.options.getInteger("id");
    const providedURL = interaction.options.getString("url");

    //Remove the unfilled param
    function checkParams(id, url) {
      if (id === null && url != null) {
        return (params = url);
      } else if (url === null && id != null) {
        return (params = id);
      }
    }

    //Remove . _ " " from the member name
    function parseName(itemName) {
      const parsedName = itemName.replace(/[\.\_\'\s]/g, "-");

      console.log(parsedName);

      return parsedName;
    }

    //Check if user's dressing has already been fetched
    async function checkChannel(itemName) {
      const guildChannels = await interaction.guild.channels.fetch();
      const channel = guildChannels.find(
        (channel) => channel.name === itemName
      );

      if (channel === undefined) {
        const channel = await interaction.guild.channels.create({
          name: itemName,
        });
        return channel.id;
      } else {
        return channel.id;
      }
    }

    async function checkDatabase(itemId) {
      const item_id = itemId;
      const prisma = new PrismaClient();

      const foundedItem = await prisma.items.findUnique({
        where: {
          itemId: item_id,
        },
        select: {
          id: true,
        },
      });

      await prisma.$disconnect();

      return foundedItem;
    }

    async function watchItem({ item, itemName }) {
      const parsedName = await parseName(itemName);
      const channelId = await checkChannel(parsedName);
      const channel = await interaction.guild.channels.fetch(channelId);
      const inDB = await checkDatabase(item.id);

      if (inDB === null) {
        const prisma = new PrismaClient();

        const pushedItem = await prisma.items.create({
          data: {
            itemId: item.id,
            title: item.title,
            price: parseFloat(item.price_numeric),
            fav_count: item.favourite_count,
            hidden: item.is_hidden === 0 ? false : true,
            reserved: item.is_reserved === 0 ? false : true,
            visible: item.is_visible === 0 ? false : true,
            closed: item.is_closed === 0 ? false : true,
            for_sell: item.is_for_sell === 0 ? false : true,
            can_be_sold: item.can_be_sold === 0 ? false : true,
          },
        });

        console.log(
          pico.green(
            `The following item has been added to the db : ${pushedItem}`
          )
        );

        await prisma.$disconnect();
      } else {
        const prisma = new PrismaClient();

        const foundedItem = await prisma.items.findUnique({
          where: {
            id: inDB.id,
          },
        });

        console.log("This item already exists in the db", foundedItem);

        await prisma.$disconnect();
      }

      //await channel.send({
      //embeds: [itemEmbed],
      //});
    }

    // Parses the url for the fetch request
    function parseVintedURL(params) {
      if (typeof params === "number") {
        return `https://www.vinted.fr/api/v2/items/${params}`;
      } else if (typeof params === "string") {
        id = params.match(/(?<=https:\/\/www.vinted.fr\/items\/)(\d+)(?=-)/g);
        return `https://www.vinted.fr/api/v2/items/${id}`;
      }
    }

    //Process the fetch request
    async function processRequest(cookie) {
      const params = await checkParams(providedId, providedURL);
      const url = new URL(parseVintedURL(params));

      try {
        const data = (await vs.vintedSearch(url, cookie)) ?? { data: [] };

        const itemName = data.item.title || undefined;

        console.log(
          pico.green(
            `Started monitoring for the following item : ${itemName}...`
          )
        );
      } catch (err) {
        return console.error(
          pico.red(
            `watchItem : An error occured during the fetch request for ${itemName} : ${err}`
          )
        );
      }

      setInterval(async () => {
        try {
          const data = (await vs.vintedSearch(url, cookie)) ?? { data: [] };

          const itemName = data.item.title || undefined;

          const item = data.item;

          console.log(
            pico.green(`Data acquired for "${itemName}". Checking data...`)
          );

          await watchItem({ item, itemName });

          console.log(
            pico.green(
              `Waiting ${process.env.INTERVAL}ms before next request for ${itemName}...`
            )
          );
        } catch (err) {
          return console.error(
            pico.red(
              `watchItem : An error occured during the fetch request for ${itemName} : ${err}`
            )
          );
        }
      }, process.env.INTERVAL);
    }

    //Run the entire script and catch errors
    try {
      const cookie = await fc.fetchCookie();
      const params = await checkParams(providedId, providedURL);
      console.log(pico.green("Cookie founded"));
      console.log(
        pico.blue(`Starting monitoring of the provided params : ${params}...`)
      );
      await processRequest(cookie);
    } catch (err) {
      return console.error(
        pico.red(
          `Process request : An error occured during the process : ${err}`
        )
      );
    }
  },
};
