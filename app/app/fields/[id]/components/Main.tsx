"use client"
import { tfield } from "@/app/types";
import dynamic from "next/dynamic"
import Config from "./Config";

const MapClient = dynamic(() => import("./MapClient") , { ssr : false});

export default function Main({field} : {field : tfield}) {
    return (
        <>
            <MapClient field={field} />
            <Config />
        </>

    )
}