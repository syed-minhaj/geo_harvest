import { Select, SelectContent, SelectValue , SelectTrigger, SelectGroup, SelectLabel, SelectItem } from '@/app/components/ui/select';


const ChangeGraphType = ({type , setType} : {type : "yearly" | "periodly" , setType : (type : "yearly" | "periodly") => void}) => {
    return (
        <Select value={type} onValueChange={(e) => {setType(type == "yearly" ? "periodly" : "yearly")}}>
            <SelectTrigger className="ml-auto lg:hidden">
                <SelectValue placeholder="Select Crop" />
            </SelectTrigger>
            <SelectContent className='z-300'>
                <SelectGroup>
                    <SelectLabel>Time period</SelectLabel>
                        <SelectItem value={"yearly"} key={"yearly"}>
                            Yearly
                        </SelectItem>
                        <SelectItem value={"periodly"} key={"periodly"}>
                            Periodly
                        </SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}

export default ChangeGraphType