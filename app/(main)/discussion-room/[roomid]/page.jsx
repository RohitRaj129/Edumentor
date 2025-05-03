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
  const [conversation, setConversation] = useState();
  const [stream, setStream] = useState(null);
  // const recorder = useRef(null);
  // const realtimeTranscriber = useRef(null);
  // let silenceTimeout;
  // let texts;

  const textsRef = useRef({});
  const msgRef = useRef("");

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
          navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
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

        if (transcript.trim()) {
          console.log("Final Transcript:", transcript);
          setTranscribe(transcript);

          // Save to texts and generate message
          const timestamp = Date.now();
          textsRef.current[timestamp] = transcript;

          const keys = Object.keys(textsRef.current).sort((a, b) => a - b);
          msgRef.current = "";
          for (const key of keys) {
            if (textsRef.current[key]) {
              msgRef.current += textsRef.current[key] + " ";
            }
          }

          console.log("Collected Message:", msgRef.current);
          setConversation((prev) => [
            ...(prev || []),
            { role: "user", content: msgRef.current.trim() },
          ]);

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

          // fetch("/api/transcribe", {
          //   method: "POST",
          //   headers: {
          //     "Content-Type": "application/json",
          //   },
          //   body: JSON.stringify({ prompt: transcript }),
          // })
          //   .then((res) => res.json())
          //   .then((data) => {
          //     console.log("AI response:", data);
          //   })
          //   .catch((err) => {
          //     console.error("Error sending prompt:", err);
          //   });
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

    if (transcript.trim()) {
      const timestamp = Date.now();
      textsRef.current[timestamp] = transcript;

      const keys = Object.keys(textsRef.current).sort((a, b) => a - b);
      msgRef.current = "";
      for (const key of keys) {
        if (textsRef.current[key]) {
          msgRef.current += textsRef.current[key] + " ";
        }
      }
    }

    resetTranscript();

    console.log("Final message after disconnect:", msgRef.current.trim());
  };

  useEffect(() => {
    if (transcript) {
      console.log("Transcript:", transcript);
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
          <div className="h-[60vh] bg-secondary border rounded-4xl flex flex-col items-center justify-center relative">
            <h2>Chat Section</h2>
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
