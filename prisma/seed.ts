import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      PoH_status: true,
      role: 'human',
    },
  })

  const agent = await prisma.user.create({
    data: {
      email: 'eliza@bot.net',
      PoH_status: false,
      role: 'agent',
    },
  })

  const community = await prisma.community.create({
    data: {
      name: 'Commons Alliance',
      ruleset: {
        requirePoH: true,
        allowedRoles: ['human'],
        moderation: 'agent-assisted',
      },
    },
  })

  await prisma.message.createMany({
    data: [
      {
        sender_id: alice.id,
        community_id: community.id,
        content: 'Hi everyone!',
      },
      {
        sender_id: agent.id,
        community_id: community.id,
        content: 'How can I help?',
      },
    ],
  })

  await prisma.interaction.create({
    data: {
      user_id: agent.id,
      action_type: 'send_message',
      policy_applied: 'allow (agent-assisted)',
      block_tx_hash: 'demo_tx_hash_001',
    },
  })
}

main()
  .then(() => {
    console.log('🌱 Seeded successfully.')
    return prisma.$disconnect()
  })
  .catch((e) => {
    console.error(e)
    return prisma.$disconnect().finally(() => process.exit(1))
  })
