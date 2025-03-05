"use client";    
import { useReducer } from 'react';
import { Seller } from './Seller';
import { Admin } from './Admin';
import  Customer  from './Customer';

const initialState = {
    role: "customer",
}
const reducer = (state, action) => {
    return { ...state, role: action.payload };
};
export const Main = () => {
const [state, dispatch] = useReducer(reducer, initialState);

const handleRoleChange = (event) => {
    dispatch({ type: event.target.value , payload: event.target.value });
};

return <>
    <h2>Main</h2>
    <p>Welcome, {state.role}!</p>
        <select onChange={handleRoleChange} value={state.role}>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
            <option value="seller">Seller</option>
        </select>
        {state.role === "customer" && <Customer />}
        {state.role === "admin" && <Admin />}
        {state.role === "seller" && <Seller />}
    </>;
}