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
      snapshot.forEach(docItem => {
        arr.push({ id: docItem.id, ...docItem.data() });
      });
      setNotes(arr);
    });

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
  }, []);

  if (notes.length === 0 && unreadMessages === 0) return null;

  return (
    <div className="space-y-3">
      {notes.map(n => (
        <div key={n.id} className="premium-panel tone-amber rounded-xl p-4 border-l-4 border-amber-300">
          <p className="text-slate-100 font-semibold">Shortlist update</p>
          <p className="text-slate-300 text-sm mt-1">You have been shortlisted by a recruiter.</p>
        </div>
      ))}

      {unreadMessages > 0 && (
        <div className="premium-panel tone-teal rounded-xl p-4 border-l-4 border-teal-300">
          <p className="text-slate-100 font-semibold">Unread messages</p>
          <p className="text-slate-300 text-sm mt-1">
            You have {unreadMessages} unread chat message{unreadMessages > 1 ? "s" : ""}.
          </p>
        </div>
      )}
    </div>
  );
}

export default Notifications;

