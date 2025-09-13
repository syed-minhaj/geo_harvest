import { HomeNavbar as Navbar } from "./components/Navbar";
import Image from "next/image";
import { Button } from "./components/ui/button";
import CardStack from "./components/cards";
import FeatureImage from "./components/featureImages";
import CardsCover from "./components/cardsCover";

export default function Home() {

    const cards = [
        {
            id : 1,
            title : "Moisture level",
            content : "Monitor crop moisture levels and identify areas that require irrigation.",
            position : "top-4 right-4",
            url : "/mositure.png"
        },
        {
            id : 2,
            title : "Nitrogen level",
            content : "Monitor crop nitrogen levels and identify areas that require fertilization.",
            position : "bottom-4 left-4",
            url: "/n.png"
        },
        {
            id : 3,
            title : "Crop Stress",
            content : "Monitor crop stress levels and identify areas suffering from growth deficiencies.",
            position : "left-4 top-4",
            url : "/stress-after.png"
        },
        {
            id : 4,
            title : "Phosphorus level",
            content : "Monitor crop phosphorus levels and identify areas that require fertilization.",
            position : "right-4 bottom-4",
            url: "/p.png"
        }
    ]

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-center font-alpet-sans w-11/12 md:w-4/6 mx-auto mb-30 gap-10  ">
                <div className="flex flex-col items-center justify-center mt-11 gap-4 ">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-none text-center">
                        <span>Farming from </span><span className="text-main">Space</span>
                    </h1>
                    <h3 className="text-xl md:text-2xl leading-none font-light w-11/12 md:w-146 text-center opacity-85 ">
                        Monitor crop health, optimize irrigation, and boost yields 
                        with <span className="text-main">satellite</span> analysis. 
                        The future of agriculture is here.
                    </h3>
                    <div className="flex flex-row gap-4 mt-4 ">
                        <Button className="bg-amber-500 hover:bg-amber-500/85  ">
                            Get Started
                        </Button>
                        <Button variant="outline" className="">
                            Learn More
                        </Button>
                    </div>
                </div>
                <div className="w-full aspect-[960/452] ">
                    <Image src="/startPage.png" alt="hero" width={960} height={452} 
                    className="mt-18 shadow-[0_4px_50px_var(--color-main)] rounded-[0.75rem]   " />
                </div>
                <h3 className="text-4xl md:text-5xl font-light tracking-tight mt-20 mb-5 ">
                    Powered by Sentinel
                </h3>
                <CardStack cards={cards}/>
                <FeatureImage cards={cards}/>
            </div>
            <footer className="flex flex-col gap-2 items-center justify-center text-accent mt-20 h-30 w-full bg-foreground">
                <a href="https://github.com/syed-minhaj/geo_harvest" className=" font-light">
                    <svg height="32" aria-hidden="true" viewBox="0 0 24 24" version="1.1" width="32" data-view-component="true" 
                        className="octicon octicon-mark-github v-align-middle fill-background ">
                        <path d="M12 1C5.923 1 1 5.923 1 12c0 4.867 3.149 8.979 7.521 10.436.55.096.756-.233.756-.522 
                        0-.262-.013-1.128-.013-2.049-2.764.509-3.479-.674-3.699-1.292-.124-.317-.66-1.293-1.127-1.554-.385-.207-.936-.715-.014-.729.866-.014 
                        1.485.797 1.691 1.128.99 1.663 2.571 1.196 3.204.907.096-.715.385-1.196.701-1.471-2.448-.275-5.005-1.224-5.005-5.432 0-1.196.426-2.186 
                        1.128-2.956-.111-.275-.496-1.402.11-2.915 0 0 .921-.288 3.024 1.128a10.193 10.193 0 0 1 2.75-.371c.936 0 1.871.123 2.75.371 2.104-1.43 
                        3.025-1.128 3.025-1.128.605 1.513.221 2.64.111 2.915.701.77 1.127 1.747 1.127 2.956 0 4.222-2.571 5.157-5.019 5.432.399.344.743 1.004.743 
                        2.035 0 1.471-.014 2.654-.014 3.025 0 .289.206.632.756.522C19.851 20.979 23 16.854 23 12c0-6.077-4.922-11-11-11Z"></path>
                    </svg>
                </a>
                <p className="text-sm  font-light">
                    Copyright © 2025 Geo Harvest. All rights reserved.
                </p>
            </footer>
        </>
    );
}
