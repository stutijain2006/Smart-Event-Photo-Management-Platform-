import { createContext , useContext } from "react";
import useBatchSelection  from "../hooks/useBatchSelection";

const BatchContext = createContext<any>(null);

export default function BatchProvider({children} : {children: React.ReactNode}) {
    const batch = useBatchSelection<string>();
    return (
        <BatchContext.Provider value={batch}>{children}</BatchContext.Provider>
    );
}
export const useBatch = () => useContext(BatchContext);
