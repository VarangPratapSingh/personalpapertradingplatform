"use client"
import { useState, useEffect } from "react";

export default function Login(){
    const [username,setusername] = useState("");
    const [password,setpassword] = useState("");
    async function dologin(){
        if (!username.trim()||!password.trim()){return;}
        const res = await fetch("https://personalpapertradingplatform.onrender.com/api/auth/login",{
            method: "POST",
            headers:{
                "Content-Type":"application/json",
            },
            body: JSON.stringify({username,password})
        });
        const data = await res.json();
        if (!res.ok){
            alert(data.msg);
            return;
        }
        localStorage.setItem("token",data.token);
        window.location.href = "/";
    }
    async function doregister(){
        if (!username.trim()||!password.trim()){return;}
        const res = await fetch("https://personalpapertradingplatform.onrender.com/api/auth/register",{
            method: "POST",
            headers:{
                "Content-Type":"application/json",
            },
            body: JSON.stringify({username,password})
        });
        const data = await res.json();
        if (!res.ok){
            alert(data.msg);
            return;
        }
        alert("Registered. Now Login");
    }
    useEffect(()=>{
        const token = localStorage.getItem("token");
        if (token){
            window.location.href = "/";
        }
    },[]);
    return (
        <div id="unapass" className="glass">
            <div id="logintitle">Login/Register Page</div>
            <input id="loginun" maxLength={16} className="circleever glass" placeholder="Username" value={username} onChange={(e)=>setusername(e.target.value)}/>
            <input id="loginpa" maxLength={16} className="circleever glass" type="password" placeholder="Password" value={password} onChange={(e)=>setpassword(e.target.value)}/>
            <button id="loginbu" className="circleever glass" onClick={dologin}>Login</button>
            <button id="regisbu" className="circleever glass" onClick={doregister}>Register</button>
        </div>
    )
}