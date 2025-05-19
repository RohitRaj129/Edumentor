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

export const AIModel = async (topic, coachingOption, userInput, history) => {
  const option = CoachingOptions.find((item) => item.name === coachingOption);
  const systemPrompt = option.prompt.replace("{user_topic}", topic);

  if (history.length === 0) {
    history.push({ role: "system", content: systemPrompt });
  }

  history.push({ role: "user", content: userInput });

  const completion = await openai.chat.completions.create({
    model: "openai/gpt-3.5-turbo",
    messages: history,
  });

  const aiMessage = completion.choices[0].message;
  history.push(aiMessage);

  return aiMessage;
};
