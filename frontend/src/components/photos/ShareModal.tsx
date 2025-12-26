import { QRCodeCanvas } from "qrcode.react";

export default function ShareModal({photoId} : {photoId : string}) {
    const shareUrl = `${window.location.origin}/photos/${photoId}`

    return (
        <div className="flex flex-col gap-4 items-center">
            <h2 className="text-[1.2rem] font-bold">Share Photo</h2>
            <input value={shareUrl} readOnly className="border p-2 w-[50vw] rounded" />
            <button onClick={() => navigator.clipboard.writeText(shareUrl)} className="bg-gray-400 px-4 py-2 rounded">
                Copy Link
            </button>
            <QRCodeCanvas value={shareUrl} size={256} />
        </div>
    )
}