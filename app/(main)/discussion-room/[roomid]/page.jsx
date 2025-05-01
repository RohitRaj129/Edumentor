"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { getToken } from "@/services/GlobalServices";
import { CoachingExpert } from "@/services/Options";
import { UserButton } from "@stackframe/stack";
import { RealtimeTranscriber } from "assemblyai";
import { useQuery } from "convex/react";
// import dynamic from "next/dynamic";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
// const RecordRTC = dynamic(() => import("recordrtc"), { ssr: false });
import RecordRTC from "recordrtc";

function DiscussionRoom() {
  const { roomid } = useParams();
  const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, {
    id: roomid,
  });
  const [expert, setExpert] = useState();
  const [enableMic, setEnableMic] = useState(false);
  const [transcribe, setTranscribe] = useState();
  const [conversation, setConversation] = useState();
  const recorder = useRef(null);
  const realtimeTranscriber = useRef(null);
  let silenceTimeout;
  let texts;

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
    setEnableMic(true);

    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(async (stream) => {
          recorder.current = new RecordRTC(stream, {
            type: "audio",
            mimeType: "audio/webm",
            recorderType: RecordRTC.StereoAudioRecorder,
          });

          recorder.current.startRecording();

          const audioCtx = new AudioContext();
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 512;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          let silenceStart = null;
          const silenceDelay = 2000; // 2 seconds

          const checkSilence = () => {
            analyser.getByteFrequencyData(dataArray);
            const average =
              dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

            const now = Date.now();
            if (average < 5) {
              if (silenceStart === null) silenceStart = now;
              else if (now - silenceStart > silenceDelay) {
                recorder.current.stopRecording(async () => {
                  const blob = recorder.current.getBlob();
                  const form = new FormData();
                  form.append("file", blob, "recording.webm");

                  const res = await fetch("/api/transcribe", {
                    method: "POST",
                    body: form,
                  });

                  const data = await res.json();
                  setTranscribe(data.text || "No result");

                  setConversation((prev) => [
                    ...(prev || []),
                    {
                      role: "user",
                      content: data.text,
                    },
                  ]);

                  stream.getTracks().forEach((t) => t.stop());
                  recorder.current = null;
                  setEnableMic(false);
                });
                return; // stop checking
              }
            } else {
              silenceStart = null;
            }

            if (recorder.current) {
              requestAnimationFrame(checkSilence);
            }
          };

          checkSilence();
        })
        .catch((err) => console.error(err));
    }
  };

  const diconnect = async (e) => {
    e.preventDefault();
    await realtimeTranscriber.current.close();
    recorder.current.pauseRecording();
    recorder.current = null;
    setEnableMic(false);
  };

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
        <h2>{transcribe}</h2>
      </div>
    </div>
  );
}

export default DiscussionRoom;
