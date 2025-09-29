import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { dayjs } from '../lib/dayjs.js'
import { ClientError } from '../errors/client-error.js'

export const getParticipants = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/trip/:tripId/participants',
    {
      schema: {
        params: z.object({
          tripId: z.uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          participants: {
            select: {
              id: true,
              name: true,
              email: true,
              isConfirmed: true,
            },
          },
        },
      })

      if (!trip) {
        throw new ClientError('Trip not found.')
      }

      return {
        participants: trip.participants,
      }
    },
  )
}
