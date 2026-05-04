const axios = require('axios');

async function testRegister() {
  try {
    const res = await axios.post("http://localhost:3000/api/auth/register", {
      username: "testuser_" + Date.now(),
      email: "test_" + Date.now() + "@example.com",
      password: "Password123!",
      role: "responder"
    });
    console.log("Response:", res.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
testRegister();
