import dayjs from 'dayjs'
import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import nodeMailer from 'nodemailer'
import { z } from "zod"
import { getMailClient } from '../lib/mail.js'
import { prisma } from "../lib/prisma.js"

export const createTrip = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post('/trip', {
    schema: {
      body: z.object({
        destination: z.string().min(4),
        starts_at: z.coerce.date(),
        ends_at: z.coerce.date(),
        owner_name: z.string(),
        owner_email: z.email()
      })
    }
  }, async (request, reply) => {
    const { destination, starts_at, ends_at, owner_name, owner_email } = request.body

    if (dayjs(starts_at).isBefore(new Date())) {
      throw new Error('Invalid trip start date')
    }

    if (dayjs(ends_at).isBefore(starts_at)) {
      throw new Error('Invalid trip start date')
    }

    const trip = await prisma.trip.create({
      data: {
        destination,
        startsAt: starts_at,
        endsAt: ends_at,
        participants: {
          create: {
            name: owner_name,
            email: owner_email,
            isOwner: true,
            isConfirmed: true
          }
        }
      }
    })

    const mail = await getMailClient()

    const message = await mail.sendMail({
      from: {
        name: "Equipe Sem Nome",
        address: 'equipe@sem.nome'
      },
      to: {
        name: owner_name,
        address: owner_email
      },
      subject: 'Testando o envio do email',
      html: `
        <p>Teste do envio de e-mail</p>
      `
    })

    console.log(nodeMailer.getTestMessageUrl(message))

    return {
      tripId: trip.id
    }
  })
}