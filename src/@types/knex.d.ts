import 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      email: string
      created_at: string
      session_id?: string
    }
    meals: {
      id: string
      name: string
      description: string
      timestamp: string
      isInDiet: boolean
    }
  }
}
