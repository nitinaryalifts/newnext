"use client"
import React, { useEffect } from 'react'

export default function AddBootstrap() {
   useEffect(()=>{
     import("bootstrap/dist/js/bootstrap.bundle.js")
   },[])
  return (
   null
  )
}
