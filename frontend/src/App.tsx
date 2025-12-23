import {use, useEffect} from 'react';
import { useAppDispatch  } from './app/hooks';
import AppRoutes from './routes/appRoutes';
import { fetchMe } from './features/auth/authslice';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchMe());
  }, []);

  return(
    <AppRoutes />
  )
}