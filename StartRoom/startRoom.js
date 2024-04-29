let button=document.getElementsByClassName("button")[0]
button.addEventListener("click",()=>{
  console.log(document.getElementsByClassName("input")[0].value)
  fetch('http://192.168.0.103:8000/gameroom', {
      method: 'POST', // Specify the method
      headers: {
        // Headers you want to send such as content type, authorization, etc.
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer your-token-here',
      },
      body: JSON.stringify({
          // The body of your POST request with the data you want to send
          "nickname": String(document.getElementsByClassName("input")[0].value),
        })
  })
})