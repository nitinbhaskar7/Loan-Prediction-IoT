import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const res = await axios.get(process.env.ESP32IP + "/verify") ;
        console.log("Response from ESP32:", res.data.data);
        if(res.data.data == -1){
            return NextResponse.json({ message: "Fingerprint not verified" , verify : -1 }
                , { status: 200 });
        }
        return NextResponse.json({ message: "Fingerprint verified successfully" , verify : res.data.data }
            , { status: 200 });
    } catch (error) {
        console.error("Error enrolling fingerprint:", error);
        return NextResponse.json({ message: "Try Again", finger : -1}, { status: 500 });
    }
}