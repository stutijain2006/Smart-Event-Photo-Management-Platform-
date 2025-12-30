import React, { useState } from "react";
type Props = {
    onFilesSelected : (file : File[]) => void
}
export default function DragDropUpload({onFilesSelected} : Props) {
    const [dragActive, setDragActive] = useState(false);
    const handleDragOver = (e : React.DragEvent<HTMLDivElement>) => {
        setDragActive(true);
        e.preventDefault();
    };

    const handleDragLeave = () => {
        setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0){
            onFilesSelected(droppedFiles);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        onFilesSelected(Array.from(e.target.files));
    };

    return(
        <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`border border-dashed rounded-lg p-10 text-center cursor-pointer transition w-[60vw] h-[40vh] my-6 bg-gray-600 ${dragActive ? "border-blue-500" : "border-gray-300" }`}
        onClick={() => document.getElementById("hiddenFileInput")?.click()}>
            <input id="hiddenFileInput" type="file" accept="image/*" multiple hidden onChange={handleFileInput} />
            <div className="text-gray-600 text-center">{dragActive ? "Drop the files here" : "Drag and drop files here or click to select files"}</div>
        </div>
    );
}