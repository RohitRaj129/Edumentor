"use client";
import Loading from "@/app/loading";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { AIModel } from "@/services/GlobalServices";
// import { getToken } from "@/services/GlobalServices";
import { CoachingExpert } from "@/services/Options";
import { UserButton } from "@stackframe/stack";
import { useQuery } from "convex/react";
import { Loader2Icon } from "lucide-react";
// import dynamic from "next/dynamic";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import ChatBox from "./_components/ChatBox";
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

  const textsRef = useRef({});
  const msgRef = useRef("");
  const [msg, setMsg] = useState("");
  const liveTranscriptRef = useRef("");
  const lastFinalTranscriptRef = useRef("");
  const isProcessingRef = useRef(false);
  const chatHistoryRef = useRef([]);

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
    // setIsLoading(true);
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
                new Promise((res) => setTimeout(res, 250)); // allow transcript to settle
              await waitForFinal();

              const finalTranscript = liveTranscriptRef.current.trim();

              console.log("⏸️ Detected Silence");
              const normalizedTranscript = finalTranscript.toLowerCase().trim();
              const lastTranscript = lastFinalTranscriptRef.current
                .toLowerCase()
                .trim();

              if (isProcessingRef.current) {
                console.log("⏳ Already processing... Skipping.");
                return;
              }
              isProcessingRef.current = true;

              if (
                normalizedTranscript &&
                normalizedTranscript !== lastTranscript
              ) {
                console.log("🎤 FINAL TRANSCRIPT:", finalTranscript);

                setConversation((prev) => [
                  ...prev,
                  {
                    role: "user",
                    content: finalTranscript,
                  },
                ]);
                //calling AI text model to get response

                const aiResp = await AIModel(
                  DiscussionRoomData.topic,
                  DiscussionRoomData.coachingOption,
                  finalTranscript,
                  chatHistoryRef.current
                );
                // await createAudioStreamFromText(aiResp);

                setConversation((prev) => [...prev, aiResp]);
                console.log("AI Response:", aiResp);

                setTranscribe(finalTranscript);
                msgRef.current += finalTranscript + " ";
                setMsg(msgRef.current.trim());
                console.log("📌 Updated Message:", msgRef.current.trim());
                lastFinalTranscriptRef.current = normalizedTranscript;
                // await processUserSpeech(finalTranscript); // Disabled
                isProcessingRef.current = false;
              } else {
                console.log("⚠️ No new speech detected.");
                isProcessingRef.current = false;
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
    // setIsLoading(true);
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
              <Button onClick={connectToServer} disabled={isLoading}>
                {isLoading && <Loader2Icon className="animate-spin" />}Connect
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={diconnect}
                disabled={isLoading}>
                {isLoading && <Loader2Icon className="animate-spin" />}
                Disconnect
              </Button>
            )}
          </div>
        </div>
        <div>
          <ChatBox conversation={conversation} />
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
