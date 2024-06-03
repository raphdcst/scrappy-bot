const { SlashCommandBuilder, Client } = require("discord.js");
const pico = require("picocolors");
const fc = require("../../utilities/fetchCookie.js");
const vs = require("../../utilities/vintedSearch.js");
const { PrismaClient } = require("@prisma/client");
const { client } = require('../../main.js')
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("monitor")
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
    //Get params from interaction
    const providedId = interaction.options.getInteger("id");
    const providedURL = interaction.options.getString("url");

    //Create new Prisma instance
    const prisma = new PrismaClient();

    const id = checkParams(providedId, providedURL);

    //Remove the unfilled param
    function checkParams(itemId, url) {
      if (itemId === null && url != null) {
        return url.match(/(?<=https:\/\/www.vinted.fr\/items\/)(\d+)(?=-)/g);
      } else if (url === null && itemId != null) {
        return itemId;
      }
    }


    //Send ephemeral reply during running
    await interaction.reply({
      content: `Starting monitoring for the following id : **${id}**`,
      ephemeral: true,
    });

    //Check if the item already exists in db
    const inDb = await prisma.item.findUnique({
      where: {
        itemId: parseInt(id),
      },
      select: {
        id: true,
      },
    });

    // Parses the url for the fetch request
    function parseVintedURL(params) {
      return `https://www.vinted.fr/api/v2/items/${params}`;
    }

    //Remove . _ " " from the item name
    function parseName(itemName) {
      const parsedName = itemName.replace(/[\.\_\'\s]/g, "-");

      return parsedName;
    }

    //Process the fetch request
    async function processRequest(id, cookie) {
      const url = new URL(parseVintedURL(id));

      try {
        const data = (await vs.vintedSearch(url, cookie)) ?? { data: [] };

        const itemName = data.item.title;

        console.log(
          pico.green(
            `${pico.gray(
              "[monitor.js]"
            )} Fetched data for the following item : ${itemName}...`
          )
        );

        return data;
      } catch (err) {
        return console.error(
          pico.red(
            `${pico.gray(
              "[monitor.js]"
            )} An error occured during the fetch request for ${itemName} : ${err}`
          )
        );
      }
    }

    //Create monitor if inDb is null
    async function createMonitor(id) {
      const cookie = await fc.fetchCookie();
      const data = await processRequest(id, cookie);

      const item = data.item;

      console.log(
        pico.cyan(`${pico.gray("[monitor.js]")} Adding ${item.title} to db...`)
      );

      await prisma.item.create({
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
        pico.green(`${pico.gray("[monitor.js]")} ${item.title} added to db`)
      );

      await prisma.monitor.create({
        data: {
          itemId: item.id,
        },
      });

      console.log(
        pico.green(`${pico.gray("[monitor.js]")} Added monitor to db`)
      );

      const itemName = parseName(item.title);

      const channel = await interaction.guild.channels.create({
        name: `${id}-${itemName}`,
      });

      await channel.setParent("1244768924701298698");

      const baseEmbed = {
        type: "rich",
        title: item.title,
        description: "_0 for false, 1 for true_",
        color: 0xa917fd,
        fields: [
          {
            name: "\u200b",
            value: `Price : **${parseFloat(item.price_numeric)}**€`,
            inline: true,
          },
          {
            name: "\u200b",
            value: `Size : **${item.size}**`,
            inline: true,
          },
          {
            name: "\u200b",
            value: `Brand : **${item.brand}**`,
            inline: true,
          },
          {
            name: "\u200b",
            value: `Fav count : **${item.favourite_count}**`,
            inline: true,
          },
          {
            name: "\u200b",
            value: `Hidden : **${item.is_hidden}**`,
            inline: true,
          },
          {
            name: "\u200b",
            value: `Reserved : **${item.is_reserved}**`,
            inline: true,
          },
          {
            name: "\u200b",
            value: `Visible : **${item.is_visible}**`,
            inline: true,
          },
          {
            name: "\u200b",
            value: `Closed : **${item.is_closed}**`,
            inline: true,
          },
          {
            name: "\u200b",
            value: `For sell : **${item.is_for_sell}**`,
            inline: true,
          },
          {
            name: "\u200b",
            value: `Can be sold : **${item.can_be_sold}**`,
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

      const msg = await channel.send({
        embeds: [baseEmbed],
      });

      await msg.pin();

      await interaction.editReply({
        content: `Started monitoring for ${itemName} in ${channel} !`,
        ephemeral: true,
      });

    }

    //Run monitor
    async function runMonitor(id) {
      console.log(
        pico.cyan(
          `${pico.gray("[monitor.js]")} Running monitor for ${id}...`
        )
      );

      const guild = await client.guilds.fetch("1078981909822066820");

      const guildChannels = guild.channels.fetch();
      const channel = guildChannels.find(
        (channel) => channel.name.includes(id) === true
      );

      setInterval(async () => {
        const cookie = await fc.fetchCookie();
        const data = await processRequest(id, cookie);

        const item = data.item;

        console.log(
          pico.cyan(
            `${pico.gray("[monitor.js]")} Data fetched for ${item.title}`
          )
        );

        const baseEmbed = {
          type: "rich",
          title: item.title,
          description: "_0 for false, 1 for true_",
          color: 0xa917fd,
          fields: [
            {
              name: "\u200b",
              value: `Price : **${parseFloat(item.price_numeric)}**€`,
              inline: true,
            },
            {
              name: "\u200b",
              value: `Size : **${item.size}**`,
              inline: true,
            },
            {
              name: "\u200b",
              value: `Brand : **${item.brand}**`,
              inline: true,
            },
            {
              name: "\u200b",
              value: `Fav count : **${item.favourite_count}**`,
              inline: true,
            },
            {
              name: "\u200b",
              value: `Hidden : **${item.is_hidden}**`,
              inline: true,
            },
            {
              name: "\u200b",
              value: `Reserved : **${item.is_reserved}**`,
              inline: true,
            },
            {
              name: "\u200b",
              value: `Visible : **${item.is_visible}**`,
              inline: true,
            },
            {
              name: "\u200b",
              value: `Closed : **${item.is_closed}**`,
              inline: true,
            },
            {
              name: "\u200b",
              value: `For sell : **${item.is_for_sell}**`,
              inline: true,
            },
            {
              name: "\u200b",
              value: `Can be sold : **${item.can_be_sold}**`,
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

        await channel.send({
          embeds: [baseEmbed],
        });
      }, process.env.INTERVAL);
    }

    if (inDb === null) {
      await createMonitor(id);
      await runMonitor(id);
    } else {
      await runMonitor(id);
    }
  },
};
