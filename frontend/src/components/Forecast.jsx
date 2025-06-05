import{useAIStore} from "@/store/aiStore.js";
import { useState } from "react";


export const Forecast = () => {
    const { getSalesForecast } = useAIStore();
    const [salesForecast, setSalesForecast] = useState(null);
    const handleSalesForecast = async () => {
        try {
        const forecast = await getSalesForecast();
        setSalesForecast(forecast);
        setError(null);
        } catch (err) {
        setError(err.message);
        }
    };
    return<>
    <button onClick={handleSalesForecast}>Get Sales Forecast</button>
        {salesForecast && <p>Sales Forecast: {salesForecast}</p>} 
    </>
}