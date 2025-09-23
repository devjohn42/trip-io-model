import dayjs from 'dayjs'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export const updateTrip = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().put(
    '/trip/:tripId',
    {
      schema: {
        params: z.object({
          tripId: z.uuid(),
        }),
        body: z.object({
          destination: z.string().min(4),
          starts_at: z.coerce.date(),
          ends_at: z.coerce.date(),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params
      const { destination, starts_at, ends_at } = request.body

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      })

      if (!trip) {
        throw new Error('Trip not found.')
      }

      if (dayjs(starts_at).isBefore(new Date())) {
        throw new Error('Invalid trip start date')
      }

      if (dayjs(ends_at).isBefore(starts_at)) {
        throw new Error('Invalid trip start date')
      }

      await prisma.trip.update({
        where: { id: tripId },
        data: {
          destination,
          startsAt: starts_at,
          endsAt: ends_at,
        },
      })

      return {
        tripId: trip.id,
      }
    },
  )
}
