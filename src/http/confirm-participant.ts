import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { ClientError } from '../errors/client-error.js'

export const confirmParticipant = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/participants/:participantId/confirm',
    {
      schema: {
        params: z.object({
          participantId: z.uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { participantId } = request.params

      const participant = await prisma.participant.findUnique({
        where: {
          id: participantId,
        },
      })

      if (!participant) {
        throw new ClientError('Participant not found')
      }

      if (participant.isConfirmed) {
        return reply.redirect(
          `http://localhost:3333/trip/${participant.trip_id}`,
        )
      }

      await prisma.participant.update({
        where: { id: participantId },
        data: { isConfirmed: true },
      })

      return reply.redirect(`http://localhost:3333/trip/${participant.trip_id}`)
    },
  )
}
