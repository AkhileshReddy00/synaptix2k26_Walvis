import { useEffect, useState } from "react";
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { FIRESTORE_FIELDS } from "../constants/firestoreFields";

// chat window for displaying messages of a specific conversation
function Chat({ conversationId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // load messages for this conversation in real-time
  useEffect(() => {
    if (!conversationId) {
      console.log("Chat: No conversationId provided");
      return;
    }

    console.log("Chat: Loading messages for conversation:", conversationId);

    const q = query(
      collection(db, "messages"),
      where(FIRESTORE_FIELDS.CONVERSATION_ID, "==", conversationId),
      orderBy(FIRESTORE_FIELDS.TIMESTAMP, "asc")
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      console.log("Chat: Loaded messages:", msgs.length);
      setMessages(msgs);
    }, error => {
      console.error("Chat: Error loading messages:", error);
    });

    return () => unsubscribe();
  }, [conversationId]);

  const sendMessage = async () => {
    if (!input.trim() || !conversationId) {
      console.warn("Cannot send: input empty or no conversationId", { input: input.trim(), conversationId });
      return;
    }

    console.log("Sending message to conversation:", conversationId);

    try {
      await addDoc(collection(db, "messages"), {
        conversationId,
        senderId: auth.currentUser.uid,
        text: input,
        [FIRESTORE_FIELDS.TIMESTAMP]: serverTimestamp()
      });
      console.log("Message sent successfully");

      // update conversation lastMessage and timestamp
      await updateDoc(doc(db, "conversations", conversationId), {
        lastMessage: input,
        [FIRESTORE_FIELDS.UPDATED_AT]: serverTimestamp()
      });
      console.log("Conversation updated");

      setInput("");
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Error sending message: " + err.message);
    }
  };

  // mark incoming messages as read when viewed
  useEffect(() => {
    if (!conversationId) return;
    const toMark = messages.filter(
      m => m.read === false && m.senderId !== auth.currentUser.uid
    );
    toMark.forEach(m => {
      updateDoc(doc(db, "messages", m.id), { read: true }).catch(() => {});
    });
  }, [messages, conversationId]);

  if (!conversationId) {
    return (
      <div className="flex-1 bg-white rounded-xl shadow p-4 flex items-center justify-center">
        <p className="text-gray-500">Select a conversation to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white rounded-xl shadow p-4 h-96 flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center pt-4">Start the conversation...</p>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`max-w-xs p-3 rounded-xl text-sm ${
                msg.senderId === auth.currentUser.uid
                  ? "bg-indigo-600 text-white ml-auto"
                  : "bg-gray-100 text-black"
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
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          className="border border-gray-300 rounded-lg flex-1 p-2 text-sm"
          placeholder="Type message..."
        />
        <button
          onClick={sendMessage}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
