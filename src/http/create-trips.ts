import dayjs from "dayjs"
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
        owner_email: z.email(),
        emails_to_invite: z.array(z.email())
      })
    }
  }, async (request, reply) => {
    const { destination, starts_at, ends_at, owner_name, owner_email, emails_to_invite } = request.body

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
          createMany: {
            data: [
              {
                name: owner_name,
                email: owner_email,
                isOwner: true,
                isConfirmed: true
              },
              ...emails_to_invite.map(email => {
                return { email }
              })
            ]
          }
        }
      }
    })

    const formattedStartDate = dayjs(starts_at).format('LL')
    const formattedEndDate = dayjs(ends_at).format('LL')

    const confirmationLink = `http://localhost:3333/trip/${trip.id}/confirm`

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
      subject: `Confirme a sua viagem para ${destination} em ${formattedStartDate}`,
      html: `
        <div>
          <p>Solicitação de viagem para <strong>${destination}</strong> nas datas de <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong>.</p>
          <p></p>
          <p>Para realizar a confirmação da sua presença, clique no link abaixo:</p>
          <p></p>
          <p>
            <a href="${confirmationLink}">Confirmar a minha presença na viagem</a>
          </p>
          <p></p>
          <p>Caso não saiba a origem, ignore esse e-mail.</p>
        </div>
      `.trim()
    })

    console.log(nodeMailer.getTestMessageUrl(message))

    return {
      tripId: trip.id
    }
  })
}