

const socket = io('http://192.168.0.103:8000')
let playerIdentity
let playerRole
let playerListsLists=[]
let roundCountforList=0
let Hitler=""
let previousChancellor=""
let voteLose=true
let loadingFinished=false
let vote=""
let currentChancellor=""
let gameContinue=true
let continueGovernment
let controlCount=0
let lostElection=false
let winRound=false
let roundCount
let cards=["liberal","fascist"]
let z 
let currentPresident
let forcedRoundCount
let addToButton
let killList=[]
let a
let b
let arg1
let arg2
let arg3

let arg4
let arg5

let firstcard
let secondcard
let wasPresident=[]

function yesClicked(e){
    e.preventDefault()
    vote="yes"
    socket.emit("election",vote)
    document.getElementById("box-6").classList.add('blur')
    document.getElementsByClassName("decisions1")[0].removeEventListener("click",yesClicked)
    document.getElementsByClassName("decisions2")[0].removeEventListener("click",noClicked)
}
function noClicked(e){
    e.preventDefault()
    vote="no"
    socket.emit("election",vote)
    document.getElementById("box-6").classList.add('blur')
    document.getElementsByClassName("decisions1")[0].removeEventListener("click",yesClicked)
    document.getElementsByClassName("decisions2")[0].removeEventListener("click",noClicked)
}
function card0(){
    socket.emit("cardSelected",cards[arg1],"card0",playerIdentity)
    document.getElementById("card0").removeEventListener("click",card0)
}
function card1(){
    socket.emit("cardSelected",cards[arg2],"card1",playerIdentity)
    document.getElementById("card1").removeEventListener("click",card1)
}
function card2(){
    socket.emit("cardSelected",cards[arg3],"card2",playerIdentity)
    document.getElementById("card2").removeEventListener("click",card2)
}
function card3(){
    socket.emit("cardSelectedByPresident",firstcard,playerIdentity)
    document.getElementById("card3").removeEventListener("click",card3)
    document.getElementById("card4").removeEventListener("click",card4)
}
function card4(){
    socket.emit("cardSelectedByPresident",secondcard,playerIdentity)
    document.getElementById("card3").removeEventListener("click",card3)
    document.getElementById("card4").removeEventListener("click",card4)
}

socket.on("Player",(player,playerRole_)=>{
    playerIdentity=player
    playerRole=playerRole_
    socket.emit("playerIdentity",playerIdentity,playerRole)
})
function findHitler(arg){
    for(i in arg ){
        if(arg[i]=="Hitler"){
            Hitler=i
            return true
        }
    }
}
socket.on("LoadGame",(playerList,playerListsList)=>{
    
    playerListsLists=playerListsList

    findHitler(playerList)

    document.getElementById("player_name").textContent=playerIdentity
    for(let i of playerListsLists){
        let parent=document.getElementById("box-5")
        let membercard=document.createElement("div")
        membercard.classList.add("membercard")
        let names=document.createElement("div")
        names.classList.add("names")
        names.textContent=i
        let membercardbutton=document.createElement("div")
        membercardbutton.classList.add("membercardbutton")
        membercardbutton.textContent="Select"
        membercardbutton.id=i
        membercard.appendChild(names)
        membercard.appendChild(membercardbutton)
        parent.appendChild(membercard)
    }
    
    if(playerRole=="Liberal"){
        document.getElementById("dummy1").classList.add("image_liberal")
        document.getElementById("dummy2").classList.add("image_liberal")
        document.getElementById("Hitler_Identification_Name").textContent="N.A"
    }
    else if(playerRole=="Fascist"){
        document.getElementById("dummy1").classList.add("image_fascist")
        document.getElementById("dummy2").classList.add("image_fascist")
        document.getElementById("Hitler_Identification_Name").textContent=Hitler
    }
    else if(playerRole=="Hitler"){
        document.getElementById("dummy1").classList.add("image_hitler")
        document.getElementById("dummy2").classList.add("image_fascist")
        document.getElementById("Hitler_Identification_Name").textContent="N.A"
    }
    loadingFinished=true
    if(loadingFinished){
        socket.emit("ReadyToStart")
    }
})
socket.on("StartGame",(roundCount_,score1,score2)=>{
    currentChancellor=""
    
    document.getElementById("liberalboxscore").textContent=score1
    document.getElementById("fascistboxscore").textContent=score2
    roundCount=roundCount_
   
    currentPresident=playerListsLists[roundCount]
    console.log(currentPresident)
    if(killList.includes(currentPresident)){
        
        socket.off("FASCISTWIN")
        socket.off("LIBERALWIN")
        socket.off("KillImmediate")
        socket.off("KillAPlayer")
        socket.off("RoundChancellor")
        socket.off("playElectionWinAnimation")
        socket.off("endElectionWinAnimation")
        socket.off("playElectionLossAnimation")
        socket.off("proceedForChancellor")
        socket.off("endForChancellor")
        socket.off("proceedForPresident")
        socket.emit("forceReset")
    }
    document.getElementById("box-6").classList.add('blur')
    document.getElementsByClassName("Chancellor_Name")[0].textContent=currentChancellor
    document.getElementsByClassName("President_Name")[0].textContent=playerListsLists[roundCount]

    if(playerListsLists[roundCount]==playerIdentity && !(wasPresident.includes(playerIdentity))){
        if(playerIdentity==Hitler){
            socket.emit("HitlerIsPresident")
        }
        wasPresident.push(playerListsLists[roundCount])
        console.log(wasPresident)
        for(let i of playerListsLists){
            console.log("Entry")
            if(!(killList.includes(i))){
                console.log("JIO")
                document.getElementById(i).addEventListener("click",()=>{
                    if(!(i==previousChancellor)){
                        socket.emit("RoundChancellorChosen",i,playerIdentity)
                    }
                })
            }
        }
    }
    socket.on("FASCISTWIN",()=>{
        document.getElementsByClassName("ChooseCardInvisiblePresident")[0].classList.remove("ChooseCard")
        document.getElementById('card3').removeAttribute("class")
        document.getElementById('card3').setAttribute("class","card")
        document.getElementById('card4').removeAttribute("class")
        document.getElementById('card4').setAttribute("class","card")
        socket.off("KillImmediate")
        socket.off("KillAPlayer")
        socket.off("RoundChancellor")
        socket.off("playElectionWinAnimation")
        socket.off("endElectionWinAnimation")
        socket.off("playElectionLossAnimation")
        socket.off("proceedForChancellor")
        socket.off("endForChancellor")
        socket.off("proceedForPresident")
        socket.emit("forceReset")
        socket.off("playLiberalAnimation")
        socket.off("endLiberalAnimation")
        setTimeout(()=>{
            document.getElementById("fascistWin").classList.add("fascistwin")
            document.getElementById("fascistWin").textContent="FASCISTS WIN"
        },300)
        
    })
    socket.on("LIBERALWIN",()=>{
        document.getElementsByClassName("ChooseCardInvisiblePresident")[0].classList.remove("ChooseCard")
        document.getElementById('card3').removeAttribute("class")
        document.getElementById('card3').setAttribute("class","card")
        document.getElementById('card4').removeAttribute("class")
        document.getElementById('card4').setAttribute("class","card")
        socket.off("KillImmediate")
        socket.off("KillAPlayer")
        socket.off("RoundChancellor")
        socket.off("playElectionWinAnimation")
        socket.off("endElectionWinAnimation")
        socket.off("playElectionLossAnimation")
        socket.off("proceedForChancellor")
        socket.off("endForChancellor")
        socket.off("proceedForPresident")
        socket.emit("forceReset")
        socket.off("playLiberalAnimation")
        socket.off("endLiberalAnimation")
        
        setTimeout(()=>{
            document.getElementById("liberalWin").classList.add("liberalwin")
            document.getElementById("liberalWin").textContent="Liberals WIN!"
        },300)
    })
    socket.on("KillAPlayer",()=>{
        if(playerListsLists[roundCount]==playerIdentity){
            a=String(prompt("Enter Player You Want to Kill (Copy Paste the name as it is)"))
            socket.emit("KillRequest",a,playerIdentity)
        }})
    socket.on("KillImmediate",(ap)=>{
        if(playerIdentity==ap){
            socket.emit("KillMe")
            document.getElementById("box-6").remove()
        }
        killList.push(ap)
        playerListsLists=playerListsLists.filter(function tillo(player){
            return player!==ap
        })
        roundCount=playerListsLists.findIndex(function gillo(player){
            return player==currentPresident
        })
        console.log(killList)
        document.getElementById(ap).parentElement.remove()
    })
        
        
    
   
    socket.on("RoundChancellor",(RoundChancellor)=>{
        document.getElementsByClassName("Chancellor_Name")[0].textContent=RoundChancellor
        console.log("Chancellor is ",RoundChancellor)
        currentChancellor=RoundChancellor
        
        if((playerListsLists[roundCount]!==playerIdentity)&&(playerIdentity!==currentChancellor)&&(!(killList.includes(playerIdentity)))){
            document.getElementById("box-6").classList.remove('blur')
            document.getElementsByClassName("decisions1")[0].addEventListener("click",yesClicked)
            document.getElementsByClassName("decisions2")[0].addEventListener("click",noClicked)
        }
        
    })
    
    socket.on("playElectionLossAnimation",()=>{
        console.log("Animation Request Received")
        document.getElementsByClassName("lossanimationconstant")[0].classList.remove('collapse')
        document.getElementsByClassName("lossanimationconstanttext")[0].classList.remove('collapse')
        document.getElementsByClassName("lossanimationconstant")[0].classList.add('electionLossAnimation')
        document.getElementsByClassName("lossanimationconstanttext")[0].classList.add('electionLossAnimationContent')
        
        previousChancellor=currentChancellor
        currentChancellor=""
        lostElection=true
        socket.off("FASCISTWIN")
        socket.off("LIBERALWIN")
        socket.off("KillImmediate")
        socket.off("KillAPlayer")
        socket.off("RoundChancellor")
        socket.off("playElectionWinAnimation")
        socket.off("endElectionWinAnimation")
        socket.off("playElectionLossAnimation")
        socket.off("proceedForChancellor")
        socket.off("endForChancellor")
        socket.off("proceedForPresident")
        
        
    })
    socket.on("endElectionLossAnimation",()=>{
        document.getElementsByClassName("lossanimationconstant")[0].classList.add('collapse')
        document.getElementsByClassName("lossanimationconstanttext")[0].classList.add('collapse')
        document.getElementsByClassName("lossanimationconstant")[0].classList.remove('electionLossAnimation')
        document.getElementsByClassName("lossanimationconstanttext")[0].classList.remove('electionLossAnimationContent')
        socket.off("endElectionLossAnimation")
        
    })
    socket.on("playElectionWinAnimation",()=>{
        document.getElementsByClassName("winanimationconstant")[0].classList.remove('collapse')
        document.getElementsByClassName("winanimationconstanttext")[0].classList.remove('collapse')
        document.getElementsByClassName("winanimationconstant")[0].classList.add('electionWinAnimation')
        document.getElementsByClassName("winanimationconstanttext")[0].classList.add('electionWinAnimationContent')
        lostElection=false
    })
    socket.on("endElectionWinAnimation",()=>{
        document.getElementsByClassName("winanimationconstant")[0].classList.add('collapse')
        document.getElementsByClassName("winanimationconstanttext")[0].classList.add('collapse')
        document.getElementsByClassName("winanimationconstant")[0].classList.remove('electionWinAnimation')
        document.getElementsByClassName("winanimationconstanttext")[0].classList.remove('electionWinAnimationContent')
        if(playerIdentity==currentChancellor){
            socket.emit("ElectionWinAnimationCompleteFromChancellor",playerIdentity)
            console.log("I emitted chancellor Notice")
        }
    })
    socket.on("proceedForChancellor",(arg1_,arg2_,arg3_)=>{
        if((playerIdentity==currentChancellor)&&(!(killList.includes(playerIdentity)))){
            arg1=arg1_
            arg2=arg2_
            arg3=arg3_
            console.log(cards[arg1],cards[arg2],cards[arg3])
            document.getElementsByClassName("ChooseCardInvisible")[0].classList.add("ChooseCard")
            document.getElementById("card0").classList.add(cards[arg1])
            document.getElementById("card1").classList.add(cards[arg2])
            document.getElementById("card2").classList.add(cards[arg3])
            document.getElementById("card0").addEventListener("click",card0)
            document.getElementById("card1").addEventListener("click",card1)
            document.getElementById("card2").addEventListener("click",card2)
        }
    })
    socket.on("endForChancellor",(arg)=>{
        if(!(arg.includes('card0'))){
            console.log("Removed from 0")
            document.getElementById("card0").removeEventListener("click",card0)
        }
        if(!(arg.includes('card1'))){
            console.log("Removed from 1")
            document.getElementById("card1").removeEventListener("click",card1)
        }
        if(!(arg.includes('card2'))){
            console.log("Removed from 2")
            document.getElementById("card2").removeEventListener("click",card2)
        }
        document.getElementById("card0").removeAttribute("class")
        document.getElementById("card0").setAttribute('class','card')
        document.getElementById("card1").removeAttribute("class")
        document.getElementById("card1").setAttribute('class','card')
        document.getElementById("card2").removeAttribute("class")
        document.getElementById("card2").setAttribute('class','card')
        document.getElementsByClassName("ChooseCardInvisible")[0].classList.remove("ChooseCard")
        
        
    })
    socket.on("proceedForPresident",(cards,score)=>{
        
        previousChancellor=currentChancellor
        if((playerListsLists[roundCount]==playerIdentity)&&((!(killList.includes(playerIdentity))))){
            arg4=cards[0]
            arg5=cards[1]
            document.getElementsByClassName("ChooseCardInvisiblePresident")[0].classList.add("ChooseCard")
            if(arg4=="liberal"){
                document.getElementById('card3').classList.add('liberal')
                firstcard="liberal"
            }
            else if(arg4=="fascist"){
                document.getElementById('card3').classList.add('fascist')
                firstcard="fascist"
            }
            if(arg5=="liberal"){
                document.getElementById('card4').classList.add('liberal')
                secondcard="liberal"
            }
            else if(arg5=="fascist"){
                document.getElementById('card4').classList.add('fascist')
                secondcard="fascist"
            }
            setTimeout(()=>{
                if(score==5){
                    b=String(prompt("Do You Wish To Veto?(Type yes/no"))
                }
                if(b=="yes" || b=="Yes" || b=="YES" || b=="YeS" || b=="yeS"){
                    socket.off("KillImmediate")
                    socket.off("KillAPlayer")
                    socket.off("RoundChancellor")
                    socket.off("playElectionWinAnimation")
                    socket.off("endElectionWinAnimation")
                    socket.off("playElectionLossAnimation")
                    socket.off("proceedForChancellor")
                    socket.off("endForChancellor")
                    socket.off("proceedForPresident")
                    socket.emit("forceReset2Ready?")
                    document.getElementsByClassName("ChooseCardInvisiblePresident")[0].classList.remove("ChooseCard")
                    document.getElementById('card3').removeAttribute("class")
                    document.getElementById('card3').setAttribute("class","card")
                    document.getElementById('card4').removeAttribute("class")
                    document.getElementById('card4').setAttribute("class","card")
                    socket.on("resetReady?",()=>{
                        console.log("Received Reset")
                        socket.emit("forceReset2")
                    },1000)
                }
                else{
                    document.getElementById("card3").addEventListener("click",card3)
                    document.getElementById("card4").addEventListener("click",card4)
            }
            },1000)
            }
    })
    socket.on("playLiberalAnimation",()=>{
        currentChancellor=""
        document.getElementById("liberalanimation").classList.add("LiberalAnimation")
        socket.off("resetReady?")
        socket.off("KillImmediate")
        socket.off("KillAPlayer")
        socket.off("DisconnectPlayer")
        socket.off("RoundChancellor")
        socket.off("playElectionWinAnimation")
        socket.off("endElectionWinAnimation")
        socket.off("playElectionLossAnimation")
        socket.off("endElectionLossAnimation")
        socket.off("proceedForChancellor")
        socket.off("endForChancellor")
        socket.off("proceedForPresident")
        
    })
    socket.on("endLiberalAnimation",()=>{
        document.getElementById("liberalanimation").classList.remove("LiberalAnimation")
        if(playerListsLists[roundCount]==playerIdentity){
            document.getElementsByClassName("ChooseCardInvisiblePresident")[0].classList.remove("ChooseCard")
            document.getElementById('card3').removeAttribute("class")
            document.getElementById('card3').setAttribute("class","card")
            document.getElementById('card4').removeAttribute("class")
            document.getElementById('card4').setAttribute("class","card")
        }
        socket.off("FASCISTWIN")
        socket.off("LIBERALWIN")
        socket.off("playLiberalAnimation")
        socket.off("endLiberalAnimation")
        
        
    })
    socket.on("playFascistAnimation",()=>{
        currentChancellor=""
        document.getElementById("fascistanimation").classList.add("FascistAnimation")
        socket.off("resetReady?")
        socket.off("KillImmediate")
        socket.off("KillAPlayer")
        socket.off("DisconnectPlayer")
        socket.off("RoundChancellor")
        socket.off("playElectionWinAnimation")
        socket.off("endElectionWinAnimation")
        socket.off("playElectionLossAnimation")
        socket.off("endElectionLossAnimation")
        socket.off("proceedForChancellor")
        socket.off("endForChancellor")
        socket.off("proceedForPresident")
    })
    socket.on(("endFascistAnimation"),()=>{
        document.getElementById("fascistanimation").classList.remove("FascistAnimation")
        if(playerListsLists[roundCount]==playerIdentity){
            document.getElementsByClassName("ChooseCardInvisiblePresident")[0].classList.remove("ChooseCard")
            document.getElementById('card3').removeAttribute("class")
            document.getElementById('card3').setAttribute("class","card")
            document.getElementById('card4').removeAttribute("class")
            document.getElementById('card4').setAttribute("class","card")
        }
        socket.off("FASCISTWIN")
        socket.off("LIBERALWIN")
        socket.off("playFascistAnimation")
        socket.off("endFascistAnimation")
    })

})






