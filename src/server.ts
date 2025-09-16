import cors from '@fastify/cors'
import fastify from 'fastify'
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import { confirmParticipant } from './http/confirm-participant.js'
import { confirmPresence } from './http/confirm-presence.js'
import { createTrip } from './http/create-trips.js'

const app = fastify()

app.register(cors, {
  origin: '*'
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(createTrip)
app.register(confirmPresence)
app.register(confirmParticipant)

app.listen({ port: 3333 }).then(() => {
  console.log('✅ HTTP SERVER RUNNING ✅')
})