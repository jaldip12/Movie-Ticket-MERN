import React from 'react'
import {HeaderA} from "../components/Headers/HeaderA"
import { AdminPanel } from '../components/Admin/AdminPanel'
import { Outlet } from 'react-router-dom'
function AdminP() {
  return (
    <div>
    
    <HeaderA/>
   
   <main>
    <Outlet />
   </main>
      
    </div>
  )
}

export default AdminP
