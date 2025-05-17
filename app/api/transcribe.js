import { AIModel } from "@/services/GlobalServices";

export async function POST(req) {
  try {
    const body = await req.json();
    const { coachingOption, prompt } = body;

    if (!coachingOption || !prompt) {
      return new Response(
        JSON.stringify({ error: "coachingOption and prompt are required" }),
        { status: 400 }
      );
    }

    const response = await AIModel(coachingOption, prompt);
    return new Response(JSON.stringify({ response }), { status: 200 });
  } catch (error) {
    console.error("Error processing transcription:", error);
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
    });
  }
}
