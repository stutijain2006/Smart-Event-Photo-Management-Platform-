import { createContext , useContext, useState } from "react";
import useBatchSelection  from "../hooks/useBatchSelection";

type BatchContextType = {
    selectedIds : string[];
    toggle: (id:string) => void;
    clear : () => void;
    selectionMode : boolean;
    setSelectionMode : React.Dispatch<React.SetStateAction<boolean>>
};

const BatchContext = createContext<BatchContextType | null>(null);

export default function BatchProvider({children} : {children: React.ReactNode}) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectionMode, setSelectionMode] = useState<boolean>(false);

    const toggle = (id:string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    const clear = () => setSelectedIds([]);

    return (
        <BatchContext.Provider value={{
            selectedIds,
            toggle,
            clear,
            selectionMode,
            setSelectionMode
        }}>{children}</BatchContext.Provider>
    );
}
export const useBatch = () => {
    const ctx = useContext(BatchContext);
    if (!ctx) {
        throw new Error("useBatch must be used within a BatchProvider");
    } 
    return ctx;
};
