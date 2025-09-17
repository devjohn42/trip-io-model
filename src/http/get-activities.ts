import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { dayjs } from '../lib/dayjs.js'

export const getActivities = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/trip/:tripId/activities',
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
          activities: {
            orderBy: {
              occursAt: 'asc',
            },
          },
        },
      })

      if (!trip) {
        throw new Error('Trip not found.')
      }

      const differenceInDaysBetweenTripStartAndEnd = dayjs(trip.endsAt).diff(
        trip.startsAt,
        'days',
      )

      const activities = Array.from({
        length: differenceInDaysBetweenTripStartAndEnd + 1,
      }).map((_, index) => {
        const date = dayjs(trip.startsAt).add(index, 'days')

        return {
          data: date.toDate(),
          activities: trip.activities.filter((activity) => {
            return dayjs(activity.occursAt).isSame(date, 'day')
          }),
        }
      })

      return {
        activities,
      }
    },
  )
}
