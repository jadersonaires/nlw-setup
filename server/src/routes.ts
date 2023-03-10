import { prisma } from "./lib/prisma"
import { FastifyInstance } from 'fastify'
import z from 'zod'
import dayjs from "dayjs"

export async function appRoutes(app: FastifyInstance) {
    app.post('/habit', async (request) => {
        const createHabitBody = z.object({
            title: z.string(),
            weekDays: z.array(
                z.number().min(0).max(6)
            )
        })

        const { title, weekDays } = createHabitBody.parse(request.body)

        const today = dayjs().startOf('day').toDate()

        await prisma.habit.create({
            data: {
                title,
                created_at: today,
                weekDays: {
                    create: weekDays.map(weekDays => {
                        return {
                            week_day: weekDays
                        }
                    })
                }
            }
        })
    })

    app.get('/day', async (request) => {
        const getDateParams = z.object({
            date: z.coerce.date()
        })

        const { date } = getDateParams.parse(request.query)

        const parseDate = dayjs(date).startOf('day')
        const weekDay = parseDate.get('day')

        const possibleHabit = await prisma.habit.findMany({
            where: { 
                created_at: {
                    lte: date,
                },
                weekDays: {
                    some: {
                        week_day: weekDay
                    }
                }
            }
        })

        const day = await prisma.day.findUnique({
            where: {
                date: parseDate.toDate()
            },
            include: {
                dayHabits: true
            }
        })

        const completedHabits = day?.dayHabits.map(dayHabit => {
            return dayHabit.habit_id
        })

        return {
            possibleHabit,
            completedHabits
        }
    })   
}
