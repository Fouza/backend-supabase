import dotenv from "dotenv";
dotenv.config();

import express from 'express'
import api from './api/index.js'
import { createClient } from '@supabase/supabase-js'
import logger from './middlewares/logger.js'

const db = createClient(
    process.env.DB_URL,
    process.env.ANON_KEY
)

const app = express()
const PORT = process.env.PORT
    console.log(PORT)

app.use(express.json())
// app.use(logger)
app.set('supabase', db)

app.get('/', (req, res) => {
    res.send('Hello world ! ')
})

app.use('/api', api())

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
