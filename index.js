import express from 'express'
import api from './api/index.js'
import auth from './api/auth.js'
import { createClient } from '@supabase/supabase-js'
import logger from './middlewares/logger.js'

const db = createClient(
    "https://icgygltsspubrhpzwbrt.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljZ3lnbHRzc3B1YnJocHp3YnJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4Nzc4MDksImV4cCI6MjA2MjQ1MzgwOX0.7p4QGGn2VbYIgY28RjGtkmW_XlV067nP8pC7rlNBfLY"
)

const app = express()
const PORT = 3000

app.use(express.json())
// app.use(logger)
app.set('supabase', db)

app.get('/', (req, res) => {
    res.send('Hello world ! ')
})

app.use('/api', api())
app.use('/auth', auth())

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
