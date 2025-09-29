import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import nodemailer from 'nodemailer'
import { prisma } from '../lib/prisma.js'
import { dayjs } from '../lib/dayjs.js'
import { getMailClient } from '../lib/mail.js'
import { ClientError } from '../errors/client-error.js'

export const createInvate = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trip/:tripId/invates',
    {
      schema: {
        params: z.object({
          tripId: z.uuid(),
        }),
        body: z.object({
          email: z.email(),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params
      const { email } = request.body

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      })

      if (!trip) {
        throw new ClientError('Trip not found.')
      }

      const participant = await prisma.participant.create({
        data: {
          email,
          trip_id: tripId,
        },
      })

      const formattedStartDate = dayjs(trip.startsAt).format('LL')
      const formattedEndDate = dayjs(trip.endsAt).format('LL')

      const mail = await getMailClient()

      const confirmationLink = `http://localhost:3333/participants/${participant.id}/confirm`

      const message = await mail.sendMail({
        from: {
          name: 'Equipe Sem Nome',
          address: 'equipe@sem.nome',
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
        `.trim(),
      })

      console.log(nodemailer.getTestMessageUrl(message))

      return { participantId: participant.id }
    },
  )
}
