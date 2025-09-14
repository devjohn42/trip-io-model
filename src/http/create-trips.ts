import dayjs from 'dayjs'
import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "../lib/prisma.js"

export const createTrip = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post('/trip', {
    schema: {
      body: z.object({
        destination: z.string().min(4),
        starts_at: z.coerce.date(),
        ends_at: z.coerce.date()
      })
    }
  }, async (request, reply) => {
    const { destination, starts_at, ends_at } = request.body

    if (dayjs(starts_at).isBefore(new Date())) {
      throw new Error('Invalid trip start date')
    }

    if (dayjs(ends_at).isBefore(starts_at)) {
      throw new Error('Invalid trip start date')
    }

    const trip = await prisma.trip.create({
      data: {
        destination,
        startsAt: starts_at,
        endsAt: ends_at
      }
    })

    return {
      tripId: trip.id
    }
  })
}