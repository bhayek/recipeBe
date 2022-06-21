const jwt = require("jsonwebtoken")
const config = require('../config/env')

const { requireAuth } = config.env


function auth(req, res, next) {
    console.log('AUTHORIZION_REQURED: ' + config.env.requireAuth)
    
    if(!requireAuth) return next()

    const token = req.header("x-auth-token")
    console.log(token)
    if(!token) return res.status(401).send("Access denied. No token provide.");

    try {
        const decoded = jwt.verify(token, config.env.jwt.accessTokenSecret)
        req.user = decoded;
        console.log(req.user)
        next();
    } catch (ex) {
        res.status(400).send("Invalid token.")
    }
} 


function isAdmin(req, res, next) {
    console.log('mwAuth read')
    
    if(!requireAuth) return cnext()

    const token = req.header("x-auth-token")
    const userObj = jwt.decode(token)
    console.log(userObj)
    if(!token) return res.status(401).send("Access denied. Admin required.");

    try {
        const decoded = jwt.verify(token, config.env.jwt.accessTokenSecret)
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(400).send("Admin required.")
    }
}   
    
// console.log(module.exports)

module.exports = {
    auth,
    isAdmin
}
