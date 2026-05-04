import { sendVerificationEmail } from "./src/services/mail.service.js";

async function test() {
  try {
    await sendVerificationEmail("mannatgupta146@gmail.com", "Test User");
    console.log("Success");
  } catch (err) {
    console.error("Failed:", err);
  }
}
test();
