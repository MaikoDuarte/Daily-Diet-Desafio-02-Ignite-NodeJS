import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { User } from './usersRoutes'

export interface Meal {
  meal_id?: string
  name: string
  description: string
  isInDiet: boolean
  session_id?: string
  created_at?: Date
}

interface MealParams {
  mealId: string
}

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', checkSessionIdExists)

  app.get('/', async (request) => {
    const { sessionId } = request.cookies

    const meals = await knex('meals').where('session_id', sessionId).select()

    return { meals }
  })

  app.get<{ Params: MealParams }>('/:mealId', async (request) => {
    const { mealId } = request.params

    const meal = await knex<Meal>('meals').where('meal_id', mealId).first()

    if (!meal) {
      return { error: 'Meal not found' }
    }

    return { meal }
  })

  app.post('/', async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      isInDiet: z.boolean(),
    })

    const { name, description, isInDiet } = createMealBodySchema.parse(
      request.body,
    )

    const { sessionId } = request.cookies

    const user = await knex<User>('users')
      .where('session_id', sessionId)
      .first()

    if (!user) {
      return reply.status(404).send({ message: 'User not found.' })
    }

    const newMeal: Meal = {
      meal_id: randomUUID(),
      name,
      description,
      isInDiet,
      session_id: sessionId,
    }

    await knex<Meal>('meals').insert(newMeal)

    return reply.status(201).send({ name, description, isInDiet })
  })

  app.put<{ Params: MealParams }>('/:mealId', async (request, reply) => {
    const updateMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      isInDiet: z.boolean(),
    })

    const { name, description, isInDiet } = updateMealBodySchema.parse(
      request.body,
    )

    const { mealId } = request.params
    const { sessionId } = request.cookies

    const user = await knex<User>('users')
      .where('session_id', sessionId)
      .first()

    if (!user) {
      return reply.status(404).send({ message: 'User not found.' })
    }

    const updatedMeal: Meal = {
      name,
      description,
      isInDiet,
      created_at: new Date(),
    }

    await knex<Meal>('meals').where('meal_id', mealId).update(updatedMeal)

    return reply.status(200).send({ message: 'Meal updated successfully' })
  })

  app.delete<{ Params: MealParams }>('/:mealId', async (request, reply) => {
    const { mealId } = request.params
    const { sessionId } = request.cookies

    const user = await knex<User>('users')
      .where('session_id', sessionId)
      .first()

    if (!user) {
      return reply.status(404).send({ message: 'User not found' })
    }

    const meal = await knex<Meal>('meals').where('meal_id', mealId).first()

    if (!meal) {
      return reply
        .status(404)
        .send({ message: 'Meal not found or does not belong to the user' })
    }

    await knex<Meal>('meals').where('meal_id', mealId).del()

    return reply.status(200).send({ message: 'Meal deleted  successfully' })
  })
}
