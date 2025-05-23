import { Router } from "express";

export default () => {
    const router = Router()


    router.get('/', async (req, res) => {
        const supabase = req.app.get('supabase')

        const { data, error } = await supabase.from("users").select("*")

        if (error) {
            res.send({
                code: 400,
                message: error.message
            })
        }

        res.send({
            code: 200,
            data
        })
    })

    router.post('/', async (req, res) => {
        const supabase = req.app.get('supabase')

        const { first_name, last_name, password, email, date_of_birth } = req.body

        const { data, error } = await supabase
            .from("users")
            .insert([{ first_name, last_name, password, email, date_of_birth }])
            .select()

        if (error) {
            res.send({
                code: 400,
                message: error.message
            })
        }
        res.send({
            code: 200,
            data
        })
    })

    router.delete('/', async (req, res) => {
        const supabase = req.app.get('supabase')
        const { id } = req.body
        const { soft_delete } = req.query
        console.log(id)
        if (!id) {
            res.send({
                code: 401,
                message: 'ID of user is required'
            })
        }

        const existUser = await supabase.from("users").select("*").eq("id", id).single()

        if (!existUser?.data) {
            res.send({
                message: 'User with specified ID does not exist'
            })
        }

        let result
        if (!soft_delete) {
            result = await supabase.from("users").delete().eq('id', id).select("*")
        } else {
            result = await supabase.from("users").update({ active: false }).eq('id', id).select("*")
        }
        const {data, error} = result
        if (error) {
            res.send({
                code: 400,
                message: error.message
            })
        }
        res.send({
            code: 200,
            data
        })
    })

    router.put('/:id', async (req, res) => {
        const supabase = req.app.get('supabase')
        const { id } = req.params
        const newdata = req.body

        console.log(newdata)
        const { data, error } = await supabase.from("users").update(newdata).eq('id', id)


        if (error) {
            res.send({
                code: 400,
                message: error.message
            })
        }
        res.send({
            code: 200,
            data
        })
    })


    router.put('/activate/:active', async (req, res) => {
        const { id } = req.body
        const { active } = req.params
        
        const {data, error} = await supabase.from("users").update({ active }).eq('id', id).select("*")

        if (error) {
            res.send({
                message: error.message
            })
        }

        res.send({
            code: 200,
            data
        })

    })
    return router
}