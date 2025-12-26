export default function DownloadPhotoModal({ onDownload} : any){
    return(
        <div className="flex flex-col gap-3">
            <h2 className="text-[1.3rem] font-bold">Download Photo</h2>
            <button onClick={() => onDownload("original")} className="px-4 py-2 bg-gray-300 text-[1rem]">Original</button>
            <button onClick={() => onDownload("watermarked")} className="px-4 py-2 bg-gray-300 text-[1rem]">Watermarked</button>
            <button onClick={() => onDownload("thumbnail")} className="px-4 py-2 bg-gray-300 text-[1rem]">Compressed</button>
         </div>
    );
}