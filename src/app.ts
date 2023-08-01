import fastify from 'fastify'
import { usersRoutes } from './routes/usersRoutes'
import cookie from '@fastify/cookie'
import { mealsRoutes } from './routes/mealsRoutes'

export const app = fastify()

app.register(cookie)

app.register(usersRoutes, { prefix: '/users' })

app.register(mealsRoutes, { prefix: '/meals' })
