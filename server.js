const path=require('path')
const PORT=3000
const express=require('express')
const fs=require('fs')
const https=require('https')
const helmet=require('helmet')
const cookie_session=require('cookie-session')

const passport=require('passport')
const {Strategy}=require('passport-google-oauth20')
require('dotenv').config() //Helps keep secret values outside of the public source code
const config={
    CLIENT_ID:process.env.CLIENT_ID,
    CLIENT_SECRET:process.env.CLIENT_SECRET,
    COOKIE_KEY1:process.env.Cookie_Key
}
const AuthOptions={
    callbackURL:'https://localhost:3000/auth/google/callback', //THIS IS THE URL THAT GOOGLE SENDS THE AUTHORIZATION CODE TO
    clientID:config.CLIENT_ID,
    clientSecret:config.CLIENT_SECRET
}
function verifyCallback(accessToken,refreshToken,profile,done){
    done(null,profile)// Instead of Null we can also pass in an error
}   //RUNS WHEN USER AUTHENTICATION IS COMPLETE
//Profile is saved as the serialized value within the cookie 


let identifyUser=
passport.use(new Strategy(AuthOptions,verifyCallback))
//TO SAVE THE SESSION TO THE COOKIE with the user Profile
passport.serializeUser((user,done)=>{
    done(null , user)
})
//TO READ THE SESSION FROM THE COOKIE (the value that was serialized)
passport.deserializeUser((object,done)=>{
    done(null , object)
})

const server=express()



server.use(express.static("StartRoom"))
server.use(helmet())

//Setting Up A Cookie-Session for our API
server.use(cookie_session({
    name:'session', //name of our session
    maxAge:1000*60*60*24, //max Duration till the Session is Alive (24 hours in this case)
    keys:[config.COOKIE_KEY1],// These  are used to sign/identify a cookie session and all incoming cookies will be checked by the server for this key.
}))
server.use(passport.initialize()) //Starts Up the Passport Cookie/Token Session
server.use(passport.session()) // Authenticates the Session using the keys
                                // Also sets the Value of the user property on the req object. 
                                //the user property is the user from the deserialised object

//This Handles all the steps from Sending Authorization Code Response to getting the Access
//token and sending the final authorization with the client secret
server.get('/auth/google/callback',passport.authenticate('google',{
    failureRedirect:'/failure',
    successRedirect:'/redirectToStart',
    session:true,
}),(req,res)=>{
    console.log('Google Called Us Up')
})
server.get('/auth/google',passport.authenticate('google',{
    //Mentions the Data that We Need from Google once authorization is Complete!
    scope:['email']
}),(req,res)=>{

})

server.get('/redirectToStart',(req,res)=>{
    res.sendFile(path.join(__dirname,"StartRoom","startRoom.html"))
})
server.get('/failure',(req,res)=>{
    res.send('Failed to Log In Please try Again')
})

server.get('/auth/logout',(req,res)=>{
    req.logout()
    res.json('LogIn Again Please')
})
const app= https.createServer({
    key:fs.readFileSync('key.pem'),
    cert:fs.readFileSync('cert.pem'),
},server)
app.listen(PORT,()=>{
    console.log("Running on PORT 3000...")
})