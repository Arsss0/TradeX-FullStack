import React from 'react'
import AppRouter from './AppRouter/AppRouter'
import './App.css'
import Header from './Components/Header/Header'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <div>
      <Header />
      <AppRouter />
      <ToastContainer position="top-right" theme="dark" />
    </div>
  )
}

export default App