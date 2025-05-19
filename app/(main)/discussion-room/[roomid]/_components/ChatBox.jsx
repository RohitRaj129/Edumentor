import React from "react";

function ChatBox({ conversation }) {
  return (
    <div>
      <div className="h-[60vh] bg-secondary border rounded-4xl p-4 overflow-y-auto">
        {/* <h2 className="text-center mb-4">Chat Section</h2> */}
        <div>
          {conversation.map((item, index) => (
            <div>
              <h2>{item?.content}</h2>
            </div>
          ))}
        </div>
      </div>
      <h2 className="mt-4 text-gray-400 text-sm">
        At the end of your conversation we will automatically generate
        feedback/notes from your conversation.
      </h2>
    </div>
  );
}

export default ChatBox;
