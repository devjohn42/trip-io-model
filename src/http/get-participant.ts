import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { ClientError } from '../errors/client-error.js'

export const getParticipant = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/participants/:participantId',
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
        select: { id: true, name: true, email: true, isConfirmed: true },
        where: { id: participantId },
      })

      if (!participant) {
        throw new ClientError('Participant not found.')
      }

      return {
        participant,
      }
    },
  )
}
