import express from 'express'
import api from './api/index.js'
import { createClient } from '@supabase/supabase-js'


const db = createClient(
    "https://gjclhkbthduammarykdw.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqY2xoa2J0aGR1YW1tYXJ5a2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4Nzc4MjgsImV4cCI6MjA2MjQ1MzgyOH0.jNdyUfpDI_YihhbhTNTeVaKC0ao69XqGJBaUjgloCc4"
)

const app = express()

const PORT = 3000

app.use(express.json())
app.set('supabase', db)

app.get('/', (req, res) => {
    res.send('Hello world ! ')
})

app.use('/api', api())

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
