import { Card } from "@/components/Card"
import data from "@/api/item/data.json"
const Home = () => {
    
    return <>
        <Card card={data} />
    </>
}

export default Home;