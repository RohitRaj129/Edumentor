// import axios from "axios";
import OpenAI from "openai";
import { CoachingOptions } from "./Options";
// import { ElevenLabsClient } from "elevenlabs";

// const elevenlabs = new ElevenLabsClient({
//   apiKey: process.env.ELEVENLABS_API_KEY,
// });

// export async function POST(req) {
//   const { text } = await req.json();

//   const audioStream = await elevenlabs.textToSpeech.stream(
//     "JBFqnCBsd6RMkjVDRZzb",
//     {
//       model_id: "eleven_multilingual_v2",
//       text,
//       output_format: "mp3_44100_128",
//       voice_settings: {
//         stability: 0,
//         similarity_boost: 1.0,
//         use_speaker_boost: true,
//         speed: 1.0,
//       },
//     }
//   );

//   const chunks = [];
//   for await (const chunk of audioStream) {
//     chunks.push(chunk);
//   }

//   const content = Buffer.concat(chunks);

//   return new Response(content, {
//     headers: {
//       "Content-Type": "audio/mpeg",
//     },
//   });
// }

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
    history.push({ role: "assistant", content: systemPrompt });
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

export const AIModelToGenerateFeedbackAndNotes = async (
  coachingOption,
  conversation
) => {
  const option = CoachingOptions.find((item) => item.name === coachingOption);
  const systemPrompt = option.summeryPrompt;

  // if (history.length === 0) {
  //   history.push({ role: "assistant", content: systemPrompt });
  // }

  // history.push({ role: "user", content: userInput });

  const completion = await openai.chat.completions.create({
    model: "openai/gpt-3.5-turbo",
    messages: [...conversation, { role: "assistant", content: systemPrompt }],
  });

  const aiMessage = completion.choices[0].message;
  // history.push(aiMessage);

  return aiMessage;
};
