const connectToServer = async () => {
  if (window.isListening) return;
  if (!browserSupportsSpeechRecognition) {
    alert("Browser does not support speech recognition.");
    return;
  }

  window.isListening = true;
  setEnableMic(true);

  textsRef.current = {};
  msgRef.current = "";

  const outerLoop = async () => {
    while (window.isListening) {
      await new Promise((resolve) => {
        resetTranscript();
        SpeechRecognition.startListening({ continuous: true });

        let silenceTimer;
        const silenceDelay = 2000;

        const monitorSilence = () => {
          clearTimeout(silenceTimer);
          silenceTimer = setTimeout(() => {
            SpeechRecognition.stopListening();
            resolve();
            setTimeout(() => {
              SpeechRecognition.startListening({ continuous: true });
            }, 500); // slight delay before restarting
          }, silenceDelay);
        };

        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
          const source = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 2048;
          source.connect(analyser);
          const data = new Uint8Array(analyser.frequencyBinCount);

          const checkForSound = () => {
            if (!window.isListening) {
              audioContext.close();
              stream.getTracks().forEach((t) => t.stop());
              resolve();
              audioContext.close();
              stream.getTracks().forEach((t) => t.stop());
              return;
            }

            analyser.getByteTimeDomainData(data);
            const isSpeaking = data.some((val) => Math.abs(val - 128) > 10);

            if (isSpeaking) {
              monitorSilence();
            }

            requestAnimationFrame(checkForSound);
          };

          checkForSound();
        });
      });

      if (transcript.trim()) {
        console.log("Final Transcript:", transcript);
        setTranscribe(transcript);

        for (const key in textsRef.current) {
          msgRef.current += textsRef.current[key] + " ";
        }
        console.log("Sending Prompt to AI:", msgRef.current);

        fetch("/api/transcribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: msgRef.current }),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("AI response:", data);
          })
          .catch((err) => {
            console.error("Error sending prompt:", err);
          });

        // Removed the previous fetch block using transcript as prompt
      }

      resetTranscript();
    }
  };

  outerLoop();
};

const diconnect = async (e) => {
  e.preventDefault();

  SpeechRecognition.stopListening();
  window.isListening = false;
  setEnableMic(false);
  resetTranscript();
  console.log("Final message after disconnect:", msgRef.current);
};
