import { useState } from "react";
import api from "../../services/api";

export default function CommentsModal({photoId, comments, refresh} : any) {
    const [text, setText] = useState("");

    const postComment = async() => {
        if (!text) return;
        await api.post(`/photos/${photoId}/comments/`, {description: text});
        setText("");
        await refresh();
    };

    return(
        <div className="space-y-4">
            <h2 className="text-[1.3rem] font-bold">Comments</h2>
            {comments.map((c : any) => (
                <div key={c.comment_id} className="border p-2 rounded-lg">
                    {c.description}
                </div>
            ))}

            <textarea value={text} onChange={(e) => setText(e.target.value)} className="border w-full p-2 rounded-lg" placeholder="Write a comment ..." />
            <button onClick={postComment} className="border w-full p-2 rounded-lg">Post</button>
        </div>
    )
}