import { useEffect, useState } from "react";
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";

// chat component using flat 'chats' collection (each doc is a message)
function Chat({ recruiterId, studentId, internshipId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // real-time listener
  useEffect(() => {
    if (!internshipId) return;

    const q = query(
      collection(db, "chats"),
      where("internshipId", "==", internshipId),
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(q, snapshot => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsub();
  }, [internshipId]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    await addDoc(collection(db, "chats"), {
      recruiterId,
      studentId,
      internshipId,
      senderId: auth.currentUser.uid,
      message: input,
      timestamp: serverTimestamp(),
      read: false
    });
    setInput("");
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 h-96 flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`max-w-xs p-3 rounded-xl text-sm ${
              msg.senderId === auth.currentUser.uid
                ? "bg-indigo-600 text-white ml-auto"
                : "bg-gray-200 text-black"
            }`}
          >
            {msg.message}
          </div>
        ))}
      </div>

      <div className="flex mt-3 gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border rounded-xl flex-1 p-2"
          placeholder="Type message..."
        />
        <button
          onClick={sendMessage}
          className="bg-indigo-600 text-white px-4 rounded-xl hover:bg-indigo-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;