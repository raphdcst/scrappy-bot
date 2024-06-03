const { PrismaClient } = require("@prisma/client");

async function startMonitors() {

  const prisma = new PrismaClient();

  const monitors = await prisma.monitor.findMany()

  

}

module.exports = {
  startMonitors,
};
