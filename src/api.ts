import { v4 as uuidv4 } from "uuid";
import { createParser } from "eventsource-parser";

export async function* streamAsyncIterable(stream) {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        return;
      }
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}
export async function fetchSSE(resource, options) {
  const { onMessage, ...fetchOptions } = options;
  const resp = await fetch(resource, fetchOptions);
  const parser = createParser((event) => {
    if (event.type === "event") {
      onMessage(event.data);
    }
  });
  for await (const chunk of streamAsyncIterable(resp.body)) {
    const str = new TextDecoder().decode(chunk);
    parser.feed(str);
  }
}


export async function getAnswer(question, accessToken): Promise<string> {
  let total = '';
  return new Promise((r,j) => {
    fetchSSE("https://chat.openai.com/backend-api/conversation", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
        authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        action: "next",
        // conversation_id: "5aceeec4-0870-4553-97c7-9512b447493c",
        messages: [
          {
            id: uuidv4(),
            role: "user",
            content: {
              content_type: "text",
              parts: [question],
            },
          },
        ],
        model: "text-davinci-002-render",
        parent_message_id: uuidv4(),
      }),
      onMessage(message) {
        console.debug("sse message", message);
        if (message === "[DONE]") {
          r(total);
        } else {
          const data = JSON.parse(message);
          const text = data.message?.content?.parts?.[0];
          if (text) {
            total = text;
          }
        }
      },
    });
  })

}
