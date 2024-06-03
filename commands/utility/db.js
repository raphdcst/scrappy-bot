const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Table } = require('embed-table')
const { PrismaClient } = require('@prisma/client')

module.exports = {
  data: new SlashCommandBuilder()
    .setName("db")
    .setDescription("Check data stored in db"),
  async execute(interaction) {
    await interaction.reply({ content: "Checking db...", ephemeral: true });

    const prisma = new PrismaClient()

    const data = prisma.item.findMany({})

    console.log(data)

    // const table = new Table({
    //     titles: ['Vinted ID', 'Title', 'Price', 'Fav count', 'Hidden', 'Reserved', 'Visible', 'Closed', 'For sell', 'Can be sold'],
    //     // titleIndexes: [0, 12, 42, 50, 61, 69, 79, 89, 98, 112],
    //     // columnIndexes: [0, 10, 40, 48, 59, 67, 77, 77, 96, 110],
    //     titleIndexes: [0,20,50,60,70]
    //     start: '`',
    //     end: '`',
    //     padEnd: 4
    // });
      
    
    // table.addRow(['37248423', 'Tee Nike x Stüssy', '30', '12', 'TRUE', 'FALSE', 'TRUE', 'FALSE', 'FALSE', 'TRUE']);
    // table.addRow(['37248423', 'Tee Nike x Stüssy', '30', '12', 'TRUE', 'FALSE', 'TRUE', 'FALSE', 'FALSE', 'TRUE']);
    // table.addRow(['37248423', 'Tee Nike x Stüssy', '30', '12', 'TRUE', 'FALSE', 'TRUE', 'FALSE', 'FALSE', 'TRUE']);
    
    // // Use this 'embed' when sending a message to a channel.
    // const embed = new EmbedBuilder().setFields(table.toField());
    
    // // Use this 'tableString' in a plain text area, (embed description or a regular message)
    // const string = table.toString();
    
    // await interaction.channel.send({embeds: [embed]})
}};
