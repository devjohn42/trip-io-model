import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { dayjs } from '../lib/dayjs.js'
import { ClientError } from '../errors/client-error.js'

export const createActivity = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trip/:tripId/activities',
    {
      schema: {
        params: z.object({
          tripId: z.uuid(),
        }),
        body: z.object({
          title: z.string().min(4),
          occurs_at: z.coerce.date(),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params
      const { title, occurs_at } = request.body

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      })

      if (!trip) {
        throw new ClientError('Trip not found.')
      }

      if (dayjs(occurs_at).isBefore(trip.startsAt)) {
        throw new ClientError('Invalid activity date.')
      }

      if (dayjs(occurs_at).isAfter(trip.endsAt)) {
        throw new ClientError('Invalid activity date.')
      }

      const activity = await prisma.activity.create({
        data: {
          title,
          occursAt: occurs_at,
          trip_id: tripId,
        },
      })

      return {
        activityId: activity.id,
      }
    },
  )
}
