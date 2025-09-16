import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import nodemailer from 'nodemailer'
import { z } from "zod"
import { dayjs } from '../lib/dayjs.js'
import { getMailClient } from "../lib/mail.js"
import { prisma } from "../lib/prisma.js"

export const confirmPresence = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get('/trip/:tripId/confirm', {
    schema: {
      params: z.object({
        tripId: z.string().min(4),
      })
    }
  }, async (request, reply) => {
    const { tripId } = request.params

    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId
      },
      include: {
        participants: {
          where: {
            isOwner: false
          }
        }
      }
    })

    if (!trip) {
      throw new Error('Trip not found.')
    }

    if (trip.isConfirmed) {
      return reply.redirect(`http://localhost:3333/trip/${tripId}`)
    }

    await prisma.trip.update({
      where: {
        id: tripId
      },
      data: {
        isConfirmed: true
      }
    })

    const formattedStartDate = dayjs(trip.startsAt).format('LL')
    const formattedEndDate = dayjs(trip.endsAt).format('LL')


    const mail = await getMailClient()

    await Promise.all(

      trip.participants.map(async (participant) => {
        const confirmationLink = `http://localhost:3333/participants/${participant.id}/confirm`

        const message = await mail.sendMail({
          from: {
            name: "Equipe Sem Nome",
            address: 'equipe@sem.nome'
          },
          to: participant.email,
          subject: `Você foi convidado(a) para participar de uma viagem para ${trip.destination} em ${formattedStartDate}`,
          html: `
                <div>
                  <p>Solicitação de viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong>.</p>
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

        console.log(nodemailer.getTestMessageUrl(message))
      })
    )

    return reply.redirect(`http://localhost:3333/trip/${tripId}`)
  })
}