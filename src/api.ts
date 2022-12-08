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
    } else {
      console.log(`[WARNING]] Recv other event type ${event.type}`, event);
    }
  });
  for await (const chunk of streamAsyncIterable(resp.body)) {
    const str = new TextDecoder().decode(chunk);
    parser.feed(str);
  }
}

interface Msg {
  id: string;
  content: {
    parts?: string[];
  }
}

export async function getAnswer(question: string, accessToken: string, conversationId?: string, parentId?: string): Promise<{answer: string, conversationId: string; id: string; finalMsg: Msg}> {
  let finalMsg: Msg;
  let total = ''; // answer content
  let id = ''; // message id
  parentId = parentId || uuidv4();
  const query: any = {
    action: "next",
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
    parent_message_id: parentId,
  };
  if(conversationId) {
    query.conversation_id = conversationId;
  }
  return new Promise((r,j) => {
    fetchSSE("https://chat.openai.com/backend-api/conversation", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
        authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(query),
      onMessage: (message) => {
        if(!finalMsg) {
          console.log("sse first response message as ", message);
        }
        // console.debug("sse message", message);
        if (message === "[DONE]") {
          console.log("message answered done", total);
          r({answer: total, conversationId, id, finalMsg});
        } else {
          const data = JSON.parse(message);
          const text = data.message?.content?.parts?.[0];
          if (text) {
            total = text;
          }
          if(!finalMsg) {
            finalMsg = data.message;
          }
          conversationId = data.conversation_id || conversationId;
          id = data.message?.id;
        }
      },
    });
  })
}
