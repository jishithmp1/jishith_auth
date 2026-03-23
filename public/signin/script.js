const form = document.getElementById("form");

form.addEventListener("submit", async(e) => {
    e.preventDefault();
    const fData = new FormData(form);
    const email = fData.get("email");
    const password = fData.get("password");

    const res = await fetch("http://localhost:3000/signin", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            password
        })
    });

    const data = await res.json();
    
    if (data) {
        localStorage.setItem("jwt", data.token);
        alert(data.message);
    } 
});