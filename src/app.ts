import { getAnswer } from "./api";
import { v4 as uuidv4 } from "uuid";
import { App } from "@slack/bolt";

interface Conversation {
  channelId: string;
  conversationId?: string, // first time will be generated by server, then save it until reset
  parentId?: string, // parent message id
}

interface State {
  instanceId: string;
  token: string;
  convesations: Array<Conversation>;
}

export class Instance {
  app: App;
  state: State;

  public constructor(app, state:State) {
    this.app = app;
    this.state = state;
    this.setup();
  }

  public async start() {
    await this.app.start();
    console.log(`[INFO] ⚡️ ChatGPT-${this.state.instanceId} Bot App started`);
  }

  private setup() {
    const app = this.app;
    const state = this.state;
    const handle = async (question: string, say: Function, channel: string) => {
      if(!state.token) {
        say(`
Not yet setup chat.openai.com bearer token, following steps to setup it:
1. open ChatGPT web site https://chat.openai.com/chat
2. chrome DevTools->network->Fetch/XHR
3. select one conversions api, and get the headers authorization, copy the "Bearer <token>"
4. back to slack, use command \`/set-chatgpt-token paste-token-here\` to setup.
Then test again!
        `);
        return ;
      }
      try {
        let conv = this.state.convesations.find(c => c.channelId === channel);
        if(!conv) {
          conv = {channelId: channel} as Conversation;
          this.state.convesations = this.state.convesations.concat([conv]);
        }
        console.debug(`[DEBUG] ${this.state.instanceId}/#${conv.channelId}.${conv.conversationId} recv question '${question}'`);
        const {answer: result, conversationId, id} = await getAnswer(question, this.state.token, conv.conversationId, conv.parentId);
        conv.conversationId = conversationId;
        conv.parentId = id;
        console.log(`[INFO] chatgpt-${this.state.instanceId}/#${conv.channelId}.${conversationId} Q: '${question}', A: ${result}`);
        say(result);
      } catch (error) {
        console.error(error);
        say(`hatgpt-${this.state.instanceId} error: \`${error.message}\``);
      }
    }
    app.message(/.*/, async ({context, say, payload, event }) => {
      return handle(context['matches'][0], say, event.channel);
    });
    app.event("app_mention", async ({context, event, say}) => {
      const q = event.text.replace(`<@${context.botUserId}>`, '');
      return handle(q, say, event.channel);
    });
    app.command("/chatgpt", async ({ command, ack, say }) => {
      await ack();
      return handle(command.text, say, command.channel_id);
    });
    app.command("/reset-chatgpt-conversation", async ({ command, ack, say }) => {
      await ack();
      state.convesations = state.convesations.filter(c => c.channelId !== command.channel_id);
      say(`\`chatgpt-${state.instanceId}\` conversation reset done.`);
    });
    app.command("/print-chatgpt-token", async ({ command, ack, say }) => {
        try {
          await ack();
          say(`\`chatgpt-${state.instanceId}\` auth token using : \`${state.token || "<not setup>"}\``);
        } catch (error) {
          console.error(error);
          say(`\`chatgpt-${state.instanceId}\` auth token get error: ${error.message}`);
        }
    });
    app.command("/set-chatgpt-token", async ({ command, ack, say }) => {
        try {
          await ack();
          let txt:any = command.text; // The inputted parameters
          state.token = txt;
          say(`\`chatgpt-${state.instanceId}\` auth setup done, current value as :\`${txt}\``);
        } catch (error) {
          console.error(error);
          say(`\`chatgpt-${state.instanceId}\` auth setup fail, error: + \`${error.message}\``);
        }
    });
  }
}

export const createInstance = (botToken: string, signingSecret: string, appToken: string, chatGpttoken: string): Instance => {
  const state: State  = {
    instanceId: uuidv4(),
    token: chatGpttoken,
    convesations: []
  };
  const app = new App({
    token: botToken,
    signingSecret: signingSecret,
    socketMode: true,
    appToken: appToken, // Token from the App-level Token that we created
  });

  return new Instance(app, state);
}