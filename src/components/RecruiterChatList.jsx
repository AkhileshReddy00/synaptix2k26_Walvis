import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { FIRESTORE_FIELDS } from "../constants/firestoreFields";

// lists all conversations for the logged-in recruiter
function RecruiterChatList({ onSelectConversation }) {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) {
      console.log("RecruiterChatList: No user logged in");
      return;
    }

    console.log("RecruiterChatList: Loading conversations for recruiter:", auth.currentUser.uid);

    const q = query(
      collection(db, "conversations"),
      where(FIRESTORE_FIELDS.RECRUITER_ID, "==", auth.currentUser.uid),
      orderBy(FIRESTORE_FIELDS.UPDATED_AT, "desc")
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const convos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("RecruiterChatList: Found conversations:", convos.length);
      setConversations(convos);
    }, error => {
      console.error("RecruiterChatList: Error loading conversations:", error);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="w-1/3 bg-white rounded-xl shadow p-4 space-y-3 max-h-96 overflow-y-auto">
      {conversations.length === 0 && (
        <p className="text-gray-500 text-center py-4">No conversations yet</p>
      )}
      {conversations.map(convo => (
        <div
          key={convo.id}
          onClick={() => onSelectConversation(convo.id)}
          className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
        >
          <p className="font-semibold text-sm">Student</p>
          <p className="text-xs text-gray-500 truncate">
            {convo.lastMessage || "(no messages yet)"}
          </p>
        </div>
      ))}
    </div>
  );
}

export default RecruiterChatList;
