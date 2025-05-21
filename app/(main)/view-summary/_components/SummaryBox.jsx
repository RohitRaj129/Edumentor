import React from "react";
import ReactMarkdown from "react-markdown";

function SummaryBox({ summary }) {
  return (
    <div className="h-[60vh] overflow-auto">
      <ReactMarkdown className="text-base/6">{summary}</ReactMarkdown>
    </div>
  );
}

export default SummaryBox;
