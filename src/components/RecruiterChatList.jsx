import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { FIRESTORE_FIELDS } from "../constants/firestoreFields";

function RecruiterChatList({ onSelectConversation }) {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }

    const q = query(
      collection(db, "conversations"),
      where(FIRESTORE_FIELDS.RECRUITER_ID, "==", auth.currentUser.uid),
      orderBy(FIRESTORE_FIELDS.UPDATED_AT, "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const convos = snapshot.docs.map(docItem => ({ id: docItem.id, ...docItem.data() }));
        setConversations(convos);
      },
      error => {
        console.error("RecruiterChatList error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="premium-panel tone-rose rounded-xl p-3 space-y-2 max-h-96 overflow-y-auto lg:w-80">
      {conversations.length === 0 && (
        <p className="text-slate-300 text-center py-4">No conversations yet</p>
      )}
      {conversations.map(convo => (
        <button
          key={convo.id}
          onClick={() => onSelectConversation(convo.id)}
          className="w-full text-left p-3 rounded-lg chat-list-item"
        >
          <p className="font-semibold text-sm text-slate-100">Student</p>
          <p className="text-xs text-slate-300 truncate mt-1">
            {convo.lastMessage || "(no messages yet)"}
          </p>
        </button>
      ))}
    </div>
  );
}

export default RecruiterChatList;


