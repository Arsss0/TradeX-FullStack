import React from 'react'
import { Route, Routes } from "react-router-dom";
import Layout from '../Components/Layout/Layout';
import Home from '../Pages/Home/Home';
import About from '../Pages/About/About';
import Coins from '../Pages/Coins/Coins';
import Trade from '../Pages/Trade/Trade';
import Auth from '../Pages/Auth/Auth';
import Profile from '../Components/Profile/Profile';
import Convert from '../Components/Convert/Convert';



const AppRouter = () => {
  return (
    <div>
        <Routes>
            <Route path='/' element={<Layout />}>
                <Route path='' element={<Home />}/> 
                <Route path='about' element={<About />}/> 
                <Route path='coins' element={<Coins />}/> 
                <Route path="trade/:coinId" element={<Trade />} />
                <Route path="/auth" element={<Auth />}/>
                <Route path="/profile" element={<Profile />} />
                <Route path="/convert" element={<Convert />} />
            </Route>
        </Routes>
    </div>
  )
}

export default AppRouter