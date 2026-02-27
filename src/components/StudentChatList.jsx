import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { FIRESTORE_FIELDS } from "../constants/firestoreFields";

// lists all conversations for the logged-in student
function StudentChatList({ onSelectConversation }) {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "conversations"),
      where(FIRESTORE_FIELDS.STUDENT_ID, "==", auth.currentUser.uid),
      orderBy(FIRESTORE_FIELDS.UPDATED_AT, "desc")
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const convos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConversations(convos);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-2">
      {conversations.map(convo => (
        <div
          key={convo.id}
          onClick={() => onSelectConversation(convo.id)}
          className="p-4 bg-white shadow rounded-xl hover:bg-gray-100 cursor-pointer"
        >
          <p className="font-semibold">Recruiter</p>
          <p className="text-sm text-gray-500 truncate">
            {convo.lastMessage}
          </p>
        </div>
      ))}
      {conversations.length === 0 && (
        <p className="text-gray-500">No conversations yet.</p>
      )}
    </div>
  );
}

export default StudentChatList;
