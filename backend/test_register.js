async function testRegister() {
  try {
    const r = Math.random().toString(36).substring(7);
    const res = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "testuser_" + r,
        email: "test_" + r + "@example.com", 
        password: "Password123!",
        role: "responder"
      })
    });
    const data = await res.json();
    console.log("Response:", data);
  } catch (err) {
    console.error("Error:", err);
  }
}
testRegister();
