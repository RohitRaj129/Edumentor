"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { getToken } from "@/services/GlobalServices";
import { CoachingExpert } from "@/services/Options";
import { UserButton } from "@stackframe/stack";
import { RealtimeTranscriber } from "assemblyai";
import { useQuery } from "convex/react";
import dynamic from "next/dynamic";
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
  const recorder = useRef(null);
  const realtimeTranscriber=useRef(null);
  let silenceTimeout;

  useEffect(() => {
    if (DiscussionRoomData) {
      const Expert = CoachingExpert.find(
        (item) => item.name == DiscussionRoomData.expertName
      );
      console.log(Expert);
      setExpert(Expert);
    }
  }, [DiscussionRoomData]);

  const connectToServer = async() => {
    setEnableMic(true);

    //Init AssemblyAi

    realtimeTranscriber.current=new RealtimeTranscriber({
      token:await getToken(),
      sample_rate:16_000,
    })

    realtimeTranscriber.current.on('transcript',async(transcript)=>{
      console.log(transcript);
    })

    await realtimeTranscriber.current.connect();

    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          recorder.current = new RecordRTC(stream, {
            type: "audio",
            MimeType: "audio/webm;codecs=pcm",
            recorderType: RecordRTC.StereoAudioRecorder,
            timeSlice: 250,
            desiredOfAudioChannels: 1,
            bufferSize: 4096,
            audioBitsPerSecond: 128000,
            ondataavailable: async (blob) => {
              //   if (!realtimeTranscriber.current) return;
              //Reset the silence detection timer on audio input
              clearTimeout(silenceTimeout);

              const buffer = await blob.arrayBuffer();

              console.log(buffer);

              //Restart the silence detection timer
              silenceTimeout = setTimeout(() => {
                console.log("User Stopped talking");
                //Handle user stopped talking (e.g., send final transcript, stop recording, etc.)
              }, 2000);
            },
          });
          recorder.current.startRecording();
        })
        .catch((err) => console.log(err));
    }
  };

  const diconnect = async(e) => {
    e.preventDefault();
    await realtimeTranscriber.current.close()
    recorder.current.pauseRecording();
    recorder.current = null;
    setEnableMic(false);
  };

  // const diconnect = async (e) => {
  //   e.preventDefault();
  
  //   if (realtimeTranscriber.current) {
  //     await realtimeTranscriber.current.close();
  //     realtimeTranscriber.current = null;
  //   }
  
  //   if (recorder.current) {
  //     recorder.current.pauseRecording();
  //     recorder.current = null;
  //   }
  
  //   setEnableMic(false);
  // };
  

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
    </div>
  );
}

export default DiscussionRoom;
