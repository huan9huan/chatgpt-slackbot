
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

const handle = async (question: string, say: Function) => {
  try {
    const result = await getAnswer(question, CACHES.token)
    say(result);
  } catch (error) {
    console.error(error);
    say(`Bot error: \`${error.message}\``);
  }
}
app.message(/.*/, async ({context, say, payload }) => {
  return handle(context['matches'][0], say);
});
app.event("app_mention", async ({context, event, say}) => {
  const q = event.text.replace(`<@${context.botUserId}>`, '');
  console.log('recv question by mention: ', q);
  return handle(q, say);
});
app.command("/chatgpt", async ({ command, ack, say }) => {
  await ack();
  return handle(command.text, say);
});

app.command("/print-chatgpt-token", async ({ command, ack, say }) => {
    try {
      await ack();
      say(`chatgpt auth token using : \`${CACHES.token || "<not setup>"}\``);
    } catch (error) {
      console.error(error);
      say(`tchatgpt auth token get error: ${error.message}`);
    }
});
app.command("/set-chatgpt-token", async ({ command, ack, say }) => {
    try {
      await ack();
      let txt:any = command.text; // The inputted parameters
      CACHES.token = txt;
      say(`chatgpt auth setup done, current value as :\`${txt}\``);
    } catch (error) {
      console.error(error);
      say(`chatgpt auth setup fail, error: + \`${error.message}\``);
    }
});