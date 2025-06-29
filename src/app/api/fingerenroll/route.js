import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const res = await axios.get(process.env.ESP32IP + "/enroll") ;
        console.log("Response from ESP32:", res.data.data);
        return NextResponse.json({ message: "Fingerprint enrolled successfully" , finger: res.data.data }
            , { status: 200 });
    } catch (error) {
        console.error("Error enrolling fingerprint:", error);
        return NextResponse.json({ message: "Try Again", finger : -1}, { status: 500 });
    }
}