import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { ClientError } from '../errors/client-error.js'

export const createLink = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trip/:tripId/links',
    {
      schema: {
        params: z.object({
          tripId: z.uuid(),
        }),
        body: z.object({
          title: z.string().min(4),
          url: z.url(),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params
      const { title, url } = request.body

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      })

      if (!trip) {
        throw new ClientError('Trip not found.')
      }

      const link = await prisma.link.create({
        data: {
          title,
          url,
          trip_id: tripId,
        },
      })

      return {
        linkId: link.id,
      }
    },
  )
}
