import fastify from 'fastify'
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import { createTrip } from './http/create-trips.js'

const app = fastify()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(createTrip)

app.listen({ port: 3333 }).then(() => {
  console.log('✅ HTTP SERVER RUNNING ✅')
})