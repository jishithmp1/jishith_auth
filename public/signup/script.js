const form = document.getElementById("form");

form.addEventListener("submit", async(e) => {
    e.preventDefault();
    const fData = new FormData(form);
    const name = fData.get("name");
    const email = fData.get("email");
    const password = fData.get("password");

    const res = await fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name,
            email,
            password
        })
    });

    const data = await res.json();
    
    if (data) {
        alert(data.message);
    } 
});