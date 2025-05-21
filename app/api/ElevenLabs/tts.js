export default async function handler(req, res) {
  const { text, voiceId = "JBFqnCBsd6RMkjVDRZzb" } = req.body;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
    {
      method: "POST",
      headers: {
        "xi-api-key": process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.8,
          speed: 1.0,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok || !response.body) {
    return res.status(500).json({ error: "TTS failed" });
  }

  res.setHeader("Content-Type", "audio/mpeg");
  response.body.pipe(res);
}
