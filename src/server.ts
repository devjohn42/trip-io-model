import cors from '@fastify/cors'
import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { confirmParticipant } from './http/confirm-participant.js'
import { confirmPresence } from './http/confirm-presence.js'
import { createTrip } from './http/create-trips.js'
import { createActivity } from './http/create-activity.js'
import { getActivities } from './http/get-activities.js'
import { createLink } from './http/create-link.js'
import { getLinks } from './http/get-links.js'
import { getParticipants } from './http/get-participants.js'
import { createInvate } from './http/create-invate.js'
import { updateTrip } from './http/update-trip.js'

const app = fastify()

app.register(cors, {
  origin: '*',
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(createTrip)
app.register(confirmPresence)
app.register(confirmParticipant)
app.register(createActivity)
app.register(getActivities)
app.register(createLink)
app.register(getLinks)
app.register(getParticipants)
app.register(createInvate)
app.register(updateTrip)

app.listen({ port: 3333 }).then(() => {
  console.log('✅ HTTP SERVER RUNNING ✅')
})
