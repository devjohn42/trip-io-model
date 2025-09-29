import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export const getTripDetails = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/trip/:tripId',
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
        select: {
          id: true,
          destination: true,
          startsAt: true,
          endsAt: true,
          isConfirmed: true,
        },
        where: { id: tripId },
      })

      if (!trip) {
        throw new Error('Trip not found.')
      }

      return {
        trip,
      }
    },
  )
}
