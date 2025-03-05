"use client";    
import jwt from "jsonwebtoken";
import { Seller } from './Seller';
import { Admin } from './Admin';
import  Customer  from './Home';
import { useEffect, useState } from "react";

export const Main = () => {
    const [role, setRole] = useState("customer");
    useEffect(() => {
        const token = sessionStorage.getItem("user_login_token");
        if (token) {
            const decoded = jwt.decode(token);
            setRole(decoded.role || "customer");
        }
    }, []);

    return <>
        {role === "customer" && <Customer />}
        {role === "admin" && <Admin />}
        {role === "seller" && <Seller />}
    </>;
}