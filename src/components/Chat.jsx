import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

// simple chat component either for specific student/recruiter pair
function Chat({ recruiterId, studentId, internshipId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [chatId, setChatId] = useState(null);

  useEffect(() => {
    if (!recruiterId || !studentId) return;

    // compute a chat document id deterministic
    const id = [recruiterId, studentId, internshipId].filter(Boolean).join("_");
    setChatId(id);

    const chatRef = doc(db, "chats", id);
    // ensure chat doc exists
    setDoc(chatRef, {
      recruiterId,
      studentId,
      internshipId: internshipId || null,
      createdAt: serverTimestamp()
    }, { merge: true });

    const msgsQuery = query(
      collection(chatRef, "messages"),
      orderBy("timestamp")
    );

    const unsub = onSnapshot(msgsQuery, snap => {
      const arr = [];
      snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
      setMessages(arr);
    });

    return () => unsub();
  }, [recruiterId, studentId, internshipId]);

  const send = async () => {
    if (!chatId || !text.trim()) return;
    const chatRef = doc(db, "chats", chatId);
    await addDoc(collection(chatRef, "messages"), {
      senderId: auth.currentUser.uid,
      text,
      timestamp: serverTimestamp()
    });
    setText("");
  };

  if (!chatId) return null;

  return (
    <div className="border p-4 rounded-lg max-w-md">
      <div className="h-64 overflow-y-auto bg-gray-50 p-3 rounded mb-2">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`p-2 rounded-lg max-w-xs ${
              msg.senderId === auth.currentUser.uid
                ? "bg-blue-500 text-white ml-auto"
                : "bg-gray-200 text-black"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="border p-2 rounded w-full"
          placeholder="Type message..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:scale-105 transition duration-200"
          onClick={send}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;