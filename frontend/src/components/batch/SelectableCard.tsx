type Props = {
    id : string;
    onClick : () => void;
    selected : boolean;
    children : React.ReactNode;
};
import { useBatch } from "./BatchProvider";

export default function SelectableCard({id, onClick, children} : Props){
    const {selectionMode, selected, toggle} = useBatch();

    return (
        <div onClick={() => selectionMode ? toggle(id) : onClick()} className="relative cursor-pointer">
            {selectionMode && (
                <input type = "checkbox" onChange= {() => toggle(id)} className="absolute top-2 left-2 z-10" />
            )}
            {children}
        </div>
    );
}