"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
// import { getToken } from "@/services/GlobalServices";
import { CoachingExpert } from "@/services/Options";
import { UserButton } from "@stackframe/stack";
import { useQuery } from "convex/react";
// import dynamic from "next/dynamic";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
// const RecordRTC = dynamic(() => import("recordrtc"), { ssr: false });
// import RecordRTC from "recordrtc";

function DiscussionRoom() {
  const { roomid } = useParams();
  const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, {
    id: roomid,
  });
  const [expert, setExpert] = useState();
  const [enableMic, setEnableMic] = useState(false);
  const [transcribe, setTranscribe] = useState();
  const [conversation, setConversation] = useState([]);
  const [stream, setStream] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // const recorder = useRef(null);
  // const realtimeTranscriber = useRef(null);
  // let silenceTimeout;
  // let texts;

  const textsRef = useRef({});
  const msgRef = useRef("");
  const [msg, setMsg] = useState("");
  const liveTranscriptRef = useRef("");
  const lastFinalTranscriptRef = useRef("");

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    if (DiscussionRoomData) {
      const Expert = CoachingExpert.find(
        (item) => item.name == DiscussionRoomData.expertName
      );
      console.log(Expert);
      setExpert(Expert);
    }
  }, [DiscussionRoomData]);

  const processUserSpeech = async (speechText) => {
    if (!speechText.trim()) return;

    // Add user message to conversation
    const userMessage = { role: "user", content: speechText.trim() };
    setConversation((prev) => [...(prev || []), userMessage]);

    // Set loading state while waiting for AI response
    setIsLoading(true);

    try {
      // Send to AI model
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: speechText.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();

      // Add AI response to conversation
      const aiMessage = {
        role: "assistant",
        content: data.response || data.text || "I didn't understand that",
      };
      setConversation((prev) => [...prev, aiMessage]);

      // Optionally, you could implement text-to-speech here to speak the AI response
    } catch (error) {
      console.error("Error processing speech:", error);
      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error processing your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

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
            silenceTimer = setTimeout(async () => {
              SpeechRecognition.stopListening();

              const waitForFinal = () =>
                new Promise((res) => setTimeout(res, 300)); // allow transcript to settle
              await waitForFinal();

              const finalTranscript = liveTranscriptRef.current.trim();

              console.log("⏸️ Detected Silence");
              if (
                finalTranscript &&
                finalTranscript !== lastFinalTranscriptRef.current
              ) {
                console.log("🎤 FINAL TRANSCRIPT:", finalTranscript);
                setTranscribe(finalTranscript);
                msgRef.current += finalTranscript + " ";
                setMsg(msgRef.current.trim());
                console.log("📌 Updated Message:", msgRef.current.trim());
                lastFinalTranscriptRef.current = finalTranscript;
                // await processUserSpeech(finalTranscript); // Disabled
              } else {
                console.log("⚠️ No new speech detected.");
              }

              resetTranscript();
              resolve();

              setTimeout(() => {
                if (window.isListening) {
                  SpeechRecognition.startListening({ continuous: true });
                }
              }, 500);
            }, silenceDelay);
          };

          const audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();
          navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
              setStream(stream);
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
      }
    };

    outerLoop();
  };

  const diconnect = async (e) => {
    e.preventDefault();

    window.isListening = false;
    setEnableMic(false);
    SpeechRecognition.stopListening();
    resetTranscript();

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    console.log("Disconnected. Mic stopped.");
  };

  useEffect(() => {
    if (transcript) {
      console.log("Transcript:", transcript);
      liveTranscriptRef.current = transcript;
    }
  }, [transcript]);

  return (
    <div className="-mt-10">
      <h2 className="text-lg font-bold">
        {DiscussionRoomData?.coachingOption}
      </h2>
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 ">
          <div className="h-[60vh] bg-secondary border rounded-4xl flex flex-col items-center justify-center relative">
            <Image
              src={expert?.avatar}
              alt="Avatar"
              width={200}
              height={200}
              className="h-[80px] w-[80px] rounded-full object-cover animate-pulse"
            />
            <h2 className="text-gray-500">{expert?.name} </h2>
            <div className="p-5 bg-gray-200 px-10 rounded-lg absolute bottom-10 right-10">
              <UserButton />
            </div>
          </div>
          <div className="mt-5 flex items-center justify-center">
            {!enableMic ? (
              <Button onClick={connectToServer}>Connect</Button>
            ) : (
              <Button variant="destructive" onClick={diconnect}>
                Disconnect
              </Button>
            )}
          </div>
        </div>
        <div>
          <div className="h-[60vh] bg-secondary border rounded-4xl p-4 overflow-y-auto">
            <h2 className="text-center mb-4">Chat Section</h2>
            <div className="flex flex-col space-y-4">
              {conversation &&
                conversation.map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg max-w-3/4 ${
                      message.role === "user"
                        ? "bg-blue-100 self-end"
                        : "bg-gray-100 self-start"
                    }`}
                  >
                    {message.content}
                  </div>
                ))}
              {isLoading && (
                <div className="self-start bg-gray-100 p-3 rounded-lg">
                  <span className="animate-pulse">Thinking...</span>
                </div>
              )}
            </div>
          </div>
          <h2 className="mt-4 text-gray-400 text-sm">
            At the end of your conversation we will automatically generate
            feedback/notes from your conversation.
          </h2>
        </div>
      </div>
      <div>
        <div className="mt-6 p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800">
            Transcription:
          </h3>
          <p className="mt-2 text-gray-700 whitespace-pre-line">
            {transcript || "Start speaking..."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default DiscussionRoom;
