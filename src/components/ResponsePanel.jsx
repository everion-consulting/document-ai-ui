import React from "react";

export default function ResponsePanel({ response }) {
  if (!response) {
    return (
      <div className="empty">
        Upload yaptıktan sonra backend cevabı burada görünecek.
      </div>
    );
  }

  return (
    <div className="response">
      <pre className="json">
        {JSON.stringify(response, null, 2)}
      </pre>
    </div>
  );
}
