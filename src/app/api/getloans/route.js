import Loan from "@/models/Loan";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import User from "@/models/User";

export async function GET(request) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        
        await dbConnect();
        
        const userId = jwt.verify(token, process.env.JWT_SECRET).userId;
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const user = await User.findById(userId).select('name');


        const loans = await Loan.aggregate([
            {
                $match:{
                    userId: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $sort: { dueDate: 1 }
            }
        ]) ;

        console.log("Loans fetched:", loans);
        
        
        return NextResponse.json({ message: "Loans fetched successfully", loans : loans || [], name : user.name}, { status: 200 });
        
    } catch (error) {
        console.error("Error fetching loans:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}