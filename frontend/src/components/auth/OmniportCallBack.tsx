import { useEffect  } from "react";
import { useAppDispatch  } from '../../app/hooks';
import { useLocation, useNavigate , useSearchParams} from "react-router-dom";
import api from "../../services/api";
import { fetchMe } from "../../features/auth/authslice";

export default function OmniportCallBack() {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        if (!code || !state) {
            navigate("/login");
            return;
        }
        if (code && state) {
            api.get(`/auth/omniport-callback?code=${code}&state=${state}`).then(async() => {
                await dispatch(fetchMe());
                navigate("/dashboard");
                }).catch(() => {
                    navigate("/login");
            });
        }
    }, []);

    return(
        <p> Signing you in ...</p>
    )
}

