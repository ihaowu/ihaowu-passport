const { PrismaClient } = require('@prisma/client')

const users = require('./data/user.json')
const templates = require('./data/email.templates.json')

const client = new PrismaClient()

async function main() {
  const tasks = []

  for (const user of users) {
    tasks.push(
      client.user.upsert({
        where: { username: user.username },
        create: user,
        update: user,
      }),
    )
  }

  for (const payload of templates) {
    async function upsert() {
      const found = await client.emailTemplate.findFirst({
        where: {
          scene: payload.scene,
        },
      })
      if (found === null) {
        return client.emailTemplate.create({
          data: payload,
        })
      }
      return client.emailTemplate.update({
        where: {
          id: found.id,
        },
        data: payload,
      })
    }
    tasks.push(upsert())
  }

  console.log('正在插入数据')
  await Promise.all(tasks)
  console.log(`处理完成`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
