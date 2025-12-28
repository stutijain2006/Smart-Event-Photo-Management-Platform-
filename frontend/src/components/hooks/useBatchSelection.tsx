import { useState } from "react";

export default function useBatchSelection<T extends string>() {
    const [selectionMode, setSelectionMode] = useState(false);
    const [selected, setSelected] = useState<T[]>([]);

    const toggle = (id:T) => {
        setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const clear = () => {
        setSelected([]);
        setSelectionMode(false);
    };

    const selectAll = (ids: T[]) => {
        setSelected(ids);
        setSelectionMode(true);
    };

    return {
        selectionMode,
        setSelectionMode,
        selected,
        setSelected,
        toggle,
        clear,
        selectAll
    };
}