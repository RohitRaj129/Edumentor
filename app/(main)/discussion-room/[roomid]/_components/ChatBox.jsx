import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { AIModelToGenerateFeedbackAndNotes } from "@/services/GlobalServices";
import { useMutation } from "convex/react";
import { LoaderCircle } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

function ChatBox({ conversation, enableFeedbackNotes, coachingOption }) {
  const [loading, setLoading] = useState(false);
  const UpdateSummary = useMutation(api.DiscussionRoom.UpdateSummary);
  const { roomid } = useParams();

  const GenerateFeedbackNotes = async () => {
    setLoading(true);
    try {
      const result = await AIModelToGenerateFeedbackAndNotes(
        coachingOption,
        conversation
      );
      console.log(result.content);
      await UpdateSummary({
        id: roomid,
        summary: result.content,
      });
      setLoading(false);
      toast("Feedback/Notes Generated Successfully");
    } catch (e) {
      setLoading(false);
      toast.error("Something went wrong, PLease try again");
    }
  };
  return (
    <div>
      <div className="h-[60vh] bg-secondary border rounded-4xl p-4 overflow-auto">
        {/* <h2 className="text-center mb-4">Chat Section</h2> */}
        {conversation.map((item, index) => (
          <div
            className={`flex ${item.role == "user" && "justify-end"}`}
            key={index}
          >
            {item.role == "assistant" ? (
              <h2 className="p-1 px-2 bg-primary mt-2 text-white inline-block rounded-md">
                {item?.content}
              </h2>
            ) : (
              <h2 className="p-1 px-2 bg-gray-200 mt-2 inline-block rounded-md justify-end">
                {item?.content}
              </h2>
            )}
          </div>
        ))}
      </div>
      {!enableFeedbackNotes ? (
        <h2 className="mt-4 text-gray-400 text-sm">
          At the end of your conversation we will automatically generate
          feedback/notes from your conversation.
        </h2>
      ) : (
        <Button
          onClick={GenerateFeedbackNotes}
          disabled={loading}
          className="mt-7 w-full"
        >
          {loading && <LoaderCircle className="animate-spin" />}Generate
          Feedback/Notes
        </Button>
      )}
    </div>
  );
}

export default ChatBox;
