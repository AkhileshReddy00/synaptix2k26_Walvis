import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

function Notifications() {
  const [notes, setNotes] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "shortlists"),
      where("studentId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const arr = [];
      snapshot.forEach(doc => {
        arr.push({ id: doc.id, ...doc.data() });
      });
      setNotes(arr);
    });

    // also listen for any unread chat messages addressed to student
    const msgQuery = query(
      collection(db, "messages"),
      where("studentId", "==", user.uid),
      where("read", "==", false)
    );
    const unsubMsgs = onSnapshot(msgQuery, snap => {
      setUnreadMessages(snap.size);
    });

    return () => {
      unsubscribe();
      unsubMsgs();
    };

    return () => unsubscribe();
  }, []);

  if (notes.length === 0 && unreadMessages === 0) return null;

  return (
    <div className="space-y-2">
      {notes.map(n => (
        <div
          key={n.id}
          className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg shadow"
        >
          🎉 You have been shortlisted!
        </div>
      ))}

      {unreadMessages > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg shadow">
          🔔 You have {unreadMessages} unread chat message{unreadMessages > 1 ? "s" : ""}.
        </div>
      )}
    </div>
  );
}

export default Notifications;