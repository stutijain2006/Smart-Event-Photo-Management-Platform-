import React from "react";
import { useBatch } from "./BatchProvider";
type Props = {
    id : string;
    onClick : () => void;
    disabled? : boolean;
    children : React.ReactNode;
};

export default function SelectableCard({id, onClick, children, disabled = false} : Props){
    const {selectionMode, selectedIds, toggle} = useBatch();
    const isSelected = selectedIds.includes(id);

    const handleClick = () => {
        if (selectionMode){
            if (!disabled) toggle(id);
            return;
        };
        onClick();
    };
    const handleCheckBoxClick = (e:React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        if (!disabled)  toggle(id);
    }

    return (
        <div onClick={handleClick} className={`relative cursor-pointer ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
            {selectionMode && (
                <input type = "checkbox" checked={isSelected} onChange={handleCheckBoxClick} className="absolute top-2 left-2 z-50 bg-white" />
            )}
            {children}
        </div>
    );
}