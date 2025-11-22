// import { PrismaClient } from "../app/generated/prisma/client";
// import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// const adapter = new PrismaMariaDb({
//   database: process.env.DATABASE_URL!,
//   connectionLimit: 5,
// });

// export const prisma = new PrismaClient({ adapter })


import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../app/generated/prisma/client'

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
export const prisma = new PrismaClient({ adapter })