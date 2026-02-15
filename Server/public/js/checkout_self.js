document.getElementById("renderBtn").addEventListener("click", async() => {
    const cashfree = Cashfree({
        mode: "sandbox",
    });
    try{
        const token=localStorage.getItem("token");
      const response=await axios.post("http://43.204.220.212/pay",{},{ headers:{ "Authorization": token } })
      const paymentSessionId=response.data.paymentSessionId;
       console.log(paymentSessionId);
    let checkoutOptions = {
        paymentSessionId: paymentSessionId,
        redirectTarget: "_self",
    };
    await cashfree.checkout(checkoutOptions);
    //localStorage.removeItem("token");
}
catch(err)
{
    console.log(err);
}
});

window.opener.postMessage("READY", "http://43.204.220.212");

window.addEventListener("message", (event) => {
  console.log("Message received from:", event.origin);

  if (event.origin === "http://43.204.220.212") {
    localStorage.setItem("token", event.data.token);
   
  }
});