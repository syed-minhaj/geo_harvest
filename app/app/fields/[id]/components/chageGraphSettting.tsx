import { Select, SelectContent, SelectValue , SelectTrigger, SelectGroup, SelectLabel, SelectItem } from '@/app/components/ui/select';


const ChangeGraphType = ({type , setType} : {type : "yearly" | "crop cycle" , setType : (type : "yearly" | "crop cycle") => void}) => {
    return (
        <Select value={type} onValueChange={(e) => {setType(type == "yearly" ? "crop cycle" : "yearly")}}>
            <SelectTrigger className="ml-auto lg:hidden">
                <SelectValue placeholder="Select Crop" />
            </SelectTrigger>
            <SelectContent className='z-300'>
                <SelectGroup>
                    <SelectLabel>Time period</SelectLabel>
                        <SelectItem value={"yearly"} key={"yearly"}>
                            Yearly
                        </SelectItem>
                        <SelectItem value={"crop cycle"} key={"crop cycle"}>
                            Crop Cycle
                        </SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}

const ChangeGraphYear = ({year , setYear , years} : {year : number , setYear : (year : number) => void , years : number[] }) => {
    return (
        <Select value={String(year)} onValueChange={(value) => {setYear(Number(value))}}>
            <SelectTrigger className="ml-auto ">
                <SelectValue placeholder="Select Crop" />
            </SelectTrigger>
            <SelectContent className='z-300'>
                <SelectGroup>
                    <SelectLabel>Year</SelectLabel>
                    {years.map((year) => 
                        <SelectItem value={String(year)} key={String(year)}>
                            {year}
                        </SelectItem>
                    )}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}


export  {ChangeGraphType , ChangeGraphYear}