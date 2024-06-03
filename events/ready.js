const pico = require("picocolors");
const { Events } = require("discord.js");
const { PrismaClient } = require('@prisma/client');

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    try {


      console.log(
        pico.green(`${pico.gray('[ready.js]')} Started monitors from db !`)
      );

      console.log(
        pico.green(`${pico.gray('[ready.js]')} Ready! Logged in as ${pico.bold(client.user.tag)}`)
      );
    } catch (err) {
      console.log(pico.red(`${pico.gray('[ready.js]')} An error occured during starting : ${err}`));
      process.exit();
    }
  },
};
