import { dbConnect } from "@/lib/dbConnect";
import { NextResponse } from "next/server";

export async function GET(request){
    dbConnect();
    return NextResponse.json({message: "Hello from the test route"});
} 