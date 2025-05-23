import { Router } from "express";

export default () => {
    const router = Router()


    router.get('/', async (req, res) => {
        const supabase = req.app.get('supabase')
        // Action to DB
        // const {first_name, last_name, email} = res.body
        // const {role} = req.query

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

    // post , we add new user
    router.post("/", async (req, res) => {
        const supabase = req.app.get("supabase");
        const newUser = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: req.body.password,
            date_of_birth: req.body.date_of_birth,
        };
        console.log("Creating user:", newUser);
        const { data, error } = await supabase
            .from("users")
            .insert([newUser])
            .single();
        console.log(data, error);
        if (error) return res.status(400).json({ error: error.message });
        res.status(201).json(data);
    });

    // PUT
    // PUT /api/products/:id

    router.put('/', async (req, res) => {
        console.log("test")
        const supabase = req.app.get('supabase')
        const { id } = req.body
        const newdata = req.body

        console.log(newdata)
        const { data, error } = await supabase.from("users").update(newdata).eq('id', id).select("*")


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

    // DELETE
    router.delete('/', async (req, res) => {
        const supabase = req.app.get('suparbase')
        const { id } = req.body
        const { soft_delete } = req.query

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
            result = await supabase.form("users").update({ active: false }).eq('id', id).select("*")
        }
        const { data, error } = result
        if (error) {
            res.send({
                code: 400,
                message: error.message
            })
        }
        res.send({
            code: 400,
            data
        })
    })
    // END POINT OF ACTIVATE USER

    /*
        router.get('/', (req, res) => {
            console.log('test')
        })
    
        router.get('/:id', (req, res) => {
            const {id} = req.params
        })
    
        router.get('/:id', (req, res) => {
            console.log('delete')
        })
    */
    return router
}