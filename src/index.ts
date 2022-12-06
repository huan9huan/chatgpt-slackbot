
import { App } from "@slack/bolt";
import { getAnswer } from "./api";
require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'local'}` });

const app = new App({
    token: process.env.SLACKBOT_TOKEN, //Find in the Oauth  & Permissions tab
    signingSecret: process.env.SLACKBOT_SIGNING_SECRET , // Find in Basic Information Tab
    socketMode: true,
    appToken: process.env.SLACKBOT_APP_TOKEN, // Token from the App-level Token that we created
});

(async () => {
  await app.start();
  console.log('⚡️ ChatGPT Bot App started');
})();

const CACHES = {
    token: process.env.CHATGPT_AUTH_TOKEN
}

app.message('hello', async ({ say }) => { // Replace hello with the message
    try {
      const q = 'hello';
      const result = await getAnswer(q, CACHES.token)
      say(result);
    } catch (error) {
        console.log("err")
      console.error(error);
    }
});
app.command("/login-chatgpt", async ({ command, ack, say }) => {
    try {
      await ack();
      let txt:any = command.text; // The inputted parameters
      CACHES.token = txt;
      say("token setup done : " + txt);
    } catch (error) {
      console.log("err")
      console.error(error);
    }
});
app.command("/chatgpt", async ({ command, ack, say }) => {
    try {
      await ack();
      let txt:any = command.text; // The inputted parameters
      const result = await getAnswer(txt, CACHES.token)
      say(result);
    } catch (error) {
      console.log("err")
      console.error(error);
    }
});
