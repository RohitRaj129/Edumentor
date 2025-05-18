// import axios from "axios";
import OpenAI from "openai";
import { CoachingOptions } from "./Options";

// export const getToken = async () => {
//   const result = await axios.get("/api/getToken");
//   return result.data;
// };

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.NEXT_PUBLIC_AI_OPENROUTER,
  dangerouslyAllowBrowser: true,
});

export const AIModel = async (topic, coachingOption, msg) => {
  const option = CoachingOptions.find((item) => item.name === coachingOption);
  const PROMPT = option.prompt.replace("{user_topic}", topic);

  const completion = await openai.chat.completions.create({
    // model: "deepseek/deepseek-chat-v3-0324:free",
    // model: "google/gemini-2.0-flash-exp:free",
    model: "openai/gpt-3.5-turbo",
    // model: "openrouter/gemini-2.0-flash-exp:free",
    messages: [
      { role: "assistant", content: PROMPT },
      { role: "user", content: msg },
    ],
  });
  console.log(completion.choices[0].message);
  return completion.choices[0].message;
};
