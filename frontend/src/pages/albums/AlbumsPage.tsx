import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import AlbumCard from "../../components/albums/AlbumCard";
import { useAppSelector } from "../../app/hooks";
import { canManagePhotos } from "../../utils/permission/permissions";
import NewAlbum from "../../components/albums/NewAlbum";

export default function AlbumPage(){
    const [myAlbums, setMyAlbums] = useState<any[]>([]);
    const navigate = useNavigate();
    const [favourite, setFavourite] = useState<any[]>([]);
    const [createAlbum, setCreateAlbum] = useState(false);
    const [tagged, setTagged] = useState<{
        photos: any[],
        albums: any[],
        events: any[]
    }>({
        photos: [],
        albums: [],
        events: []
    });
    const [search, setSearch] = useState("");

    const { user } = useAppSelector((state) => state.auth);
    console.log("USER FROM API:", user);
    const canManage = canManagePhotos(user?.roles);

    useEffect (() => {
        api.get("/my/albums").then(res => setMyAlbums(res.data));
        api.get("/my/favourite"). then(res => setFavourite(res.data));
        api.get("/my/tags").then(res => setTagged(res.data));
    }, []);

    const filteredAlbums = myAlbums.filter((album: any) => album.album_name.toLowerCase().includes(search.toLowerCase()));
    const onClose = () => navigate("/");

    return(
        <DashboardLayout>
            <div className="p-6 w-full h-screen flex flex-col jusitfy-center items-start">
                <div className="justify-center items-start flex mb-6 gap-4">
                    <div className="flex justify-center items-start gap-16">
                        <button onClick={onClose} className='text-[1.6rem] font-semibold'>←</button>
                        <div className="text-[1.4rem] font-bold">Albums</div>
                    </div>
                    <div className="flex justify-center items-start gap-12 text-[1rem]">
                        <input type = "text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} className="border p-2 rounded-lg w-[40vw]"></input>

                        {canManage && (
                            <button className="border p-2 rounded-lg w-[40vw]" onClick={() => setCreateAlbum(true)}> + Create Album </button>
                        )}
                    </div>
                </div>

                <Section title="My Albums">
                    {filteredAlbums.map((album: any) => <AlbumCard key={album.album_id} album={album} />)}
                </Section> 

                <Section title= "Favourite">
                    <AlbumCard album={{
                        album_name: "Liked Photos",
                        isVirtual: true,
                        route : "/my-favourite"
                    }} />
                </Section>

                <Section title="Albums You're Tagged In">
                    {tagged.albums.map((album: any) => <AlbumCard key={album.album_id} album={{
                        album_name : album.album_name || "Tagged Album",
                        album_id : album.album_id
                    }} />)}
                </Section>
            </div>
            <NewAlbum 
                isOpen={createAlbum}
                onClose={() => setCreateAlbum(false)}
                onCreated = {() => {
                    api.get(`/albums/`).then(res => setMyAlbums(res.data));
                }} 
            />
        </DashboardLayout>
    );
}

function Section({title, children}: any){
    return(
        <div className="mb-8">
            <h2 className="text-[1.2rem] font-semibold mb-4">{title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {children}
            </div>
        </div>
    );
}