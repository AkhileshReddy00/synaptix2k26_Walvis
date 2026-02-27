import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { FIRESTORE_FIELDS } from "../constants/firestoreFields";

function StudentChatList({ onSelectConversation }) {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "conversations"),
      where(FIRESTORE_FIELDS.STUDENT_ID, "==", auth.currentUser.uid),
      orderBy(FIRESTORE_FIELDS.UPDATED_AT, "desc")
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const convos = snapshot.docs.map(docItem => ({ id: docItem.id, ...docItem.data() }));
      setConversations(convos);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="wa-list max-h-96 overflow-y-auto">
      {conversations.map(convo => (
        <button
          key={convo.id}
          onClick={() => onSelectConversation(convo.id)}
          className="wa-list-item"
        >
          <p className="font-semibold text-sm text-slate-100">Recruiter</p>
          <p className="text-xs text-slate-300 truncate mt-1">
            {convo.lastMessage || "(no messages yet)"}
          </p>
        </button>
      ))}
      {conversations.length === 0 && (
        <p className="text-slate-300 text-center py-3">No conversations yet.</p>
      )}
    </div>
  );
}

export default StudentChatList;


