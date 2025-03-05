export const Language = () => {
    return <>
        <div className="h-10 flex items-center px-4 rounded-lg hover:bg-gray-50">
            <select className="border border-gray-300 rounded-md" defaultValue="en">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="te">Telugu</option>
            </select>
        </div>
    </>
}