import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { Meal } from './mealsRoutes'

export interface User {
  user_id: string
  name: string
  email: string
  session_id: string
}

interface Metrics {
  totalMeals: number
  totalInDiet: number
  totalOutOfDiet: number
  bestInDietSequence: Meal[]
}

export async function usersRoutes(app: FastifyInstance) {
  app.get('/', async (request) => {
    const { sessionId } = request.cookies

    const user = await knex('users').where('session_id', sessionId).first()

    if (!user) {
      return { error: 'User not found' }
    }

    const meals = await knex('meals')
      .where('session_id', sessionId)
      .select()
      .orderBy('created_at')

    const totalMeals = meals.length
    const totalInDiet = meals.filter((meal) => meal.isInDiet).length
    const totalOutOfDiet = totalMeals - totalInDiet

    let currentSequence: Meal[] = []
    let bestSequence: Meal[] = []

    meals.forEach((meal) => {
      if (meal.isInDiet) {
        currentSequence.push(meal)
      } else {
        if (currentSequence.length > bestSequence.length) {
          bestSequence = currentSequence
        }
        currentSequence = []
      }
    })

    if (currentSequence.length > bestSequence.length) {
      bestSequence = currentSequence
    }

    const metrics: Metrics = {
      totalMeals,
      totalInDiet,
      totalOutOfDiet,
      bestInDietSequence: bestSequence,
    }

    return { user, metrics }
  })

  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
    })

    const { name, email } = createUserBodySchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    const existingUser = await knex<User>('users')
      .where('session_id', sessionId)
      .first()

    if (existingUser) {
      return reply.status(400).send({
        message:
          'A user with the same session_id already exists. Please clear cookies before creating a new user.',
      })
    }

    const newUser: User = {
      user_id: randomUUID(),
      name,
      email,
      session_id: sessionId,
    }

    await knex<User>('users').insert(newUser)

    return reply.status(201).send({ sessionId, name, email })
  })
}
