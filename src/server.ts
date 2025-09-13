import fastify from 'fastify'

const app = fastify()

app.get('/test', () => {
  return 'Test Route'
})

app.listen({ port: 3333 }).then(() => {
  console.log('✅ HTTP SERVER RUNNING ✅')
})