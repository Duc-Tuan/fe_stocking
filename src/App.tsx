import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { getMe } from "./auth/authSlice";
import router from "./routes";
import type { AppDispatch } from "./store";
import { Toaster } from 'react-hot-toast';
import './App.css'

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(getMe());
    }
  }, [dispatch]);


  return <>
    <Toaster position="top-center" reverseOrder={false} />
    <RouterProvider router={router} />
  </>
}

export default App;
