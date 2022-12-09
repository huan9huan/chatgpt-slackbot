
import { createInstance } from "./app";

require('dotenv').config();

(async () => {
  const instance = createInstance(process.env.SLACKBOT_TOKEN,process.env.SLACKBOT_SIGNING_SECRET,process.env.SLACKBOT_APP_TOKEN, process.env.CHATGPT_AUTH_TOKEN);
  await instance.start();
})();

