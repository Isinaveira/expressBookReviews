const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"secretKey",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    const authHeader = req.headers.authorization;
    //Comprobamos si existe la cabecera 
    if (!authHeader) {
        return res.status(401).json({ message: "No se ha pasado un token" });
    }
    //Obtenemos el token 
    const token = authHeader.split(' ')[1]; 

    //Verificamos la integridad del token
    jwt.verify(token, "secretKey", (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Token incorrecto" });
        }

        //Si el token es correcto devolvemos el decodificado
        req.user = decoded;
        next();
    });

});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
