import { useEffect  } from "react";
import { useAppDispatch  } from '../../app/hooks';
import { useLocation, useNavigate , useSearchParams} from "react-router-dom";
import api from "../../services/api";
import { fetchMe } from "../../features/auth/authslice";

export default function OmniportCallBack() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(fetchMe()).then(() => {
            navigate("/");
        }).catch(() => {
            navigate("/login");
        })
    }, []);

    return(
        <p> Signing you in ...</p>
    )
}

