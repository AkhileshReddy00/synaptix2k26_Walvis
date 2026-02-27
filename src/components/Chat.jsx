import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { FIRESTORE_FIELDS } from "../constants/firestoreFields";

function Chat({ conversationId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!conversationId) return;

    const q = query(
      collection(db, "messages"),
      where(FIRESTORE_FIELDS.CONVERSATION_ID, "==", conversationId),
      orderBy(FIRESTORE_FIELDS.TIMESTAMP, "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const msgs = snapshot.docs.map(docItem => ({ id: docItem.id, ...docItem.data() }));
        setMessages(msgs);
      },
      error => {
        console.error("Chat load error:", error);
      }
    );

    return () => unsubscribe();
  }, [conversationId]);

  const sendMessage = async () => {
    if (!input.trim() || !conversationId) return;

    try {
      await addDoc(collection(db, "messages"), {
        conversationId,
        senderId: auth.currentUser.uid,
        text: input,
        [FIRESTORE_FIELDS.TIMESTAMP]: serverTimestamp()
      });

      await updateDoc(doc(db, "conversations", conversationId), {
        lastMessage: input,
        [FIRESTORE_FIELDS.UPDATED_AT]: serverTimestamp()
      });

      setInput("");
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Error sending message: " + err.message);
    }
  };

  useEffect(() => {
    if (!conversationId) return;

    const toMark = messages.filter(
      msg => msg.read === false && msg.senderId !== auth.currentUser.uid
    );

    toMark.forEach(msg => {
      updateDoc(doc(db, "messages", msg.id), { read: true }).catch(() => {});
    });
  }, [messages, conversationId]);

  if (!conversationId) {
    return (
      <div className="wa-chat-empty min-h-[22rem]">
        <p className="text-slate-300">Select a conversation to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="wa-chat-window h-96 flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.length === 0 ? (
          <p className="text-slate-300 text-center pt-4">Start the conversation...</p>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`max-w-xs p-3 rounded-lg text-sm ${
                msg.senderId === auth.currentUser.uid
                  ? "wa-bubble-out ml-auto"
                  : "wa-bubble-in"
              }`}
            >
              {msg.text}
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="wa-input flex-1"
          placeholder="Type message..."
        />
        <button onClick={sendMessage} className="wa-send-btn">
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;

