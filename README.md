# chatgpt as slack bot
![chatgpt inside slack](./img/chatgpt-demo-v1.gif)

### FEATURES
- Set the chatgpt token by command `/set-chatgpt-token`
- Talk with `@ChatGPT` in DM channel
- Invite the `@ChatGPT` then direct, then mention `@ChatGPT` to talk with ChatGPT
- Conversation by channel
  - each channel (DM, group, public channel etc) give one conversation
  - reset the channel conversation by `/reset-chatgpt-conversation`

## Setup Slack Bot by Web site
click [Add To Slack](https://chatgpt.slackext.com/)

## Setup from Zero

Goal: we will step by step to fill the `.env` properties

### create a slack app in your workspace
  - open socket mode
  - set the App Display name as your need
  - Add bot user since we want to mention @ChatGPT to let it work

### setup scopes
goto app oauth page: https://api.slack.com/apps/<replace-app-id>/oauth, make Scopes as:
![setup scope](./img/scope.png)
- where `chat:write` can direct talk in im
- where `app_mentions:read` can `@ChatGPT` to talk in channel

### setup commands
make Scopes as:
![setup command](./img/command.png)
where
- `/chatgpt` Command to direct send question to ChatGPT
- `/reset-chatgpt-conversation` Command to reset the conversation thread to cleanup the context
- `/set-chatgpt-token` Command to globally set new Bearer Auth token which are copied from ChatGPT website
- `/print-chatgpt-token` Command to print current Bearer Auth token

### Finally, we can setup such following values in .env file
- Find in the Oauth  & Permissions tab `SLACKBOT_TOKEN=xoxb-`
- Find in Basic Information Tab `SLACKBOT_SIGNING_SECRET=`
- Token from the App-level Token that we created `SLACKBOT_APP_TOKEN=xapp-xxx`

### copy the Bearer Auth token from ChatGPT website
![how to copy auth token](./img/token.png)
put into .env file `CHATGPT_AUTH_TOKEN=<copied token value>`
- you can use `/set-chatgpt-token` to setup the token for update, e.g. you may need reset the thread, and don't want to reset the bot server.

### run the bot app
```
git clone
npm i
npm run build
npm run start
```
then you can use ChatGPT in Slack.

### Docker run
```
docker build -t chatgpt-slackbot
docker run -it --rm chatgpt-slackbot
```

### Discord support
<a href='https://discord.gg/WFbxPgqkjF'>
<img src='./img/discord-icon-svgrepo-com.svg' height='32' /> Join Discord to support
</a>

### Have Fun with ChatGPT inside Slack!