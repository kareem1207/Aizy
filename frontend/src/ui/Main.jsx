"use client";    
import jwt from "jsonwebtoken";
import { Seller } from './Seller';
import { Admin } from './Admin';
import  Customer  from './Home';

export const Main = () => {
    const token = sessionStorage.getItem("user_login_token");
    const decoded = token ? jwt.decode(token) : {};
    const role = decoded.role || "customer";

    return <>
        {role === "customer" && <Customer />}
        {role === "admin" && <Admin />}
        {role === "seller" && <Seller />}
    </>;
}