let list=["box1","box2"]
let g
function de(){
    console.log(g)
}
for (let i of list){
    g=i
    document.getElementById(i).addEventListener("click",de)
}
