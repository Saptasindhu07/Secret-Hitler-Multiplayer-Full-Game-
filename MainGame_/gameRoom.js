const PORT=8000
const fs=require('fs')
const http=require('http')
const cors=require('cors')
const helmet=require('helmet')
const express=require('express')
const path=require('path')
const { read } = require('fs')
const server=express()
const app=http.createServer(server)
app.listen(PORT,()=>{
    console.log("Listening on Port ",PORT)
})
server.use( helmet({ contentSecurityPolicy: false }) )
server.use(cors())
const io = require('socket.io')(app, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
});



let player=""
let playerRole=""
let playerList={}
let gameModes=["Fascist","Liberal","Hitler"]
let fascistCount=0
let HitlerCount=0
let playeronBrowser=""
let roleonBrowser=""
let playerListsList=[]
let Hitler_
let count=0
let dummy=0
let readytostartClients=0
let yesVote=0
let noVote=0
let voterCount=0
let roundCount=0
let electionAnimatonCheck=0
let cardSelected=0
let buttonSelectedByChancellor=[]
let cardsForPresident=[]
let mainGameScoreLiberal=0
let mainGameScoreFascist=0
let cards=["liberal","fascist"]
let currentChancellor=""

function electionTrack(vote){
    if (vote=="yes"){
        yesVote+=1
    }
    else if(vote=="no"){
        noVote+=1
    }
}



function randomSelectMode(){
    if(count==4 && (fascistCount==0 && HitlerCount==0)){
        return gameModes[0]
    } 
    else if(count==5 && (fascistCount==0 && HitlerCount==1)){
        return gameModes[0]
    }
    else if(count==5 && (fascistCount==1 && HitlerCount==0)){
        return gameModes[2]
    }
    else{
        if((fascistCount==1) && (HitlerCount==1)){
            return gameModes[1] 
        }
        else if(fascistCount==1 && HitlerCount<1){
            let randomInt=Math.floor(Math.random() * 2)+1
            if(gameModes[randomInt]=="Hitler"){
                HitlerCount+=1
            }
            return gameModes[randomInt]
        }

        else if(HitlerCount==1 && fascistCount<1){
            let randomInt=Math.floor(Math.random() * 2)
            if(gameModes[randomInt]=="Fascist"){
                fascistCount+=1
            }
            return gameModes[randomInt]
        }
        else if(fascistCount<1 && HitlerCount<1){
            let randomInt=Math.floor(Math.random() * 3)
            if(gameModes[randomInt]=="Fascist"){
                fascistCount+=1
                return gameModes[randomInt]
            }
            else if(gameModes[randomInt]=="Hitler"){
                HitlerCount+=1
                return gameModes[randomInt]
            }
            else if(gameModes[randomInt]=="Liberal"){
                return gameModes[randomInt]
            }
        }
    }
}


  


server.use(express.json())

server.post('/gameroom',(req,res)=>{
    
    count=count+1
    console.log(count)
    if(count>5){
        res.send("Room is Full")
    }
    else{
        player=req.body.nickname
        playerRole=randomSelectMode(player)
        playerListsList.push(String(req.body.nickname))
        playerList[req.body.nickname]= playerRole
        res.end()
    }
})
// server.get("/",(req,res)=>{
    //res.sendFile(path.join(__dirname,"MainGame","gameBrowser.html"))
//}) 


let room1="Liberals"
let room2="Fascists"
io.on('connection',(socket)=>{
    socket.emit("Player",player,playerRole)
    player=""
    playerRole=""
    if(count==5){
        io.emit("LoadGame",playerList,playerListsList)
    }
    socket.on("ReadyToStart",()=>{
        readytostartClients+=1
        if(readytostartClients==5){
            io.emit("StartGame",roundCount,mainGameScoreLiberal,mainGameScoreFascist)
        }
    })
    socket.on("RoundChancellorChosen",(RoundChancellorChosen,authorise)=>{
        currentChancellor=RoundChancellorChosen
        console.log("chanceloor is ",RoundChancellorChosen)
        io.emit("RoundChancellor",RoundChancellorChosen)
    })
    socket.on("election",(vote)=>{
        voterCount+=1
        electionTrack(vote)
        if(voterCount==(playerListsList.length-2)){
            voterCount=0
            if(yesVote>=noVote){
                io.emit("playElectionWinAnimation")
                setTimeout(() => {
                    io.emit("endElectionWinAnimation")
                }, 3000)
            }
            else if(yesVote<noVote){
                roundCount+=1
                if(!(playerListsList[roundCount])){
                    roundCount=0
                }
                io.emit("playElectionLossAnimation")
                setTimeout(()=>{
                    io.emit("endElectionLossAnimation")
                    },3000
                )
                setTimeout(()=>{
                    io.emit("StartGame",roundCount,mainGameScoreLiberal,mainGameScoreFascist)
                    },3500
                )
            }
            yesVote=0
            noVote=0
        }
    })
    socket.on("ElectionWinAnimationCompleteFromChancellor",(identity)=>{
        console.log("Entered ERROR")
        if(identity==currentChancellor){
            let randomInt1=Math.floor(Math.random() * 2)
            let randomInt2=Math.floor(Math.random() * 2)
            let randomInt3=Math.floor(Math.random() * 2)
            socket.emit("proceedForChancellor",randomInt1,randomInt2,randomInt3)
            console.log(cards[randomInt1],cards[randomInt2],cards[randomInt3])
        }
    })
    socket.on("cardSelected",(arg1,arg2,identity)=>{
        if(identity==currentChancellor){
            cardsForPresident.push(arg1)
            buttonSelectedByChancellor.push(arg2)
            cardSelected+=1
            if(cardSelected==2){
                console.log(buttonSelectedByChancellor)
                console.log(cardsForPresident)
                cardSelected=0
                socket.emit("endForChancellor",buttonSelectedByChancellor)
                buttonSelectedByChancellor=[]
                io.emit("proceedForPresident",cardsForPresident,mainGameScoreFascist)
                cardsForPresident=[]
            }
        }
    })
    socket.on("cardSelectedByPresident",(FinalCard,authorise)=>{
        if(authorise==playerListsList[roundCount]){
            
            roundCount+=1
            if(!(playerListsList[roundCount])){
                roundCount=0
            }
            if(FinalCard=="liberal"){
                mainGameScoreLiberal+=1
                console.log(roundCount)
                if(mainGameScoreLiberal==5){
                    io.emit("LIBERALWIN")
                    
                }
                else{
                io.emit("playLiberalAnimation")
                setTimeout(()=>{
                    io.emit("endLiberalAnimation")
                },3000)
                setTimeout(()=>{
                    io.emit("StartGame",roundCount,mainGameScoreLiberal,mainGameScoreFascist)
                },4000)
            }
            }
            else if(FinalCard=="fascist"){
                mainGameScoreFascist+=1
                console.log(roundCount)
                if(mainGameScoreFascist==6){
                    io.emit("FASCISTWIN")
                }
                else{
                    io.emit("playFascistAnimation")
                    setTimeout(()=>{
                        io.emit("endFascistAnimation")
                    },3000)
                    setTimeout(()=>{
                        io.emit("StartGame",roundCount,mainGameScoreLiberal,mainGameScoreFascist)
                    },4000)
                    setTimeout(()=>{
                        if(mainGameScoreFascist==4 || mainGameScoreFascist==5){
                            io.emit("KillAPlayer")
                        }
                    },6000)
                }
            }
        }
    })
    socket.on("KillRequest",(argument_,president_)=>{
        playerListsList=playerListsList.filter(function killo(player){
            return player!==argument_
        })
        io.emit("KillImmediate",argument_)
        roundCount=playerListsList.findIndex(function zillo(santa){
            return santa==president_
        })
        console.log(playerListsList)
        console.log(roundCount)
    })
    socket.on("KillMe",()=>{
        socket.disconnect()
    })
    socket.on("forceReset",()=>{
        roundCount+=1
        if(!(playerListsList[roundCount])){
            roundCount=0
        }
        setTimeout(()=>{
            io.emit("StartGame",roundCount,mainGameScoreLiberal,mainGameScoreFascist)
        },1000)
    })
    socket.on("forceReset2Ready?",()=>{
        socket.emit("resetReady?")
    })
    socket.on("forceReset2",()=>{
        setTimeout(()=>{
            console.log(mainGameScoreFascist)
            console.log(mainGameScoreLiberal)
            io.emit("StartGame",roundCount,mainGameScoreLiberal,mainGameScoreFascist)
        },1000)
        
    })
    socket.on("HitlerIsPresident",()=>{
        if(mainGameScoreFascist>3){
            io.emit("FASCISTWIN")
        }
    })
})
io.on("playerIdentity",(playerIdentity)=>{
    playeronBrowser=playerIdentity
})
