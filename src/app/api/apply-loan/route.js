import Loan from "@/models/Loan";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/dbConnect";
export async function POST(request) {
    try {   
        await dbConnect();
        const {loanAmount, loanTerm} = await request.json();
        console.log("Received data:", { loanAmount, loanTerm });
        // Find user from cookies
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const userId = jwt.verify(token, process.env.JWT_SECRET).userId;
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        // Validate loan amount and term

        if (!loanAmount || !loanTerm || loanAmount <= 0 || loanTerm <= 0) {
            return NextResponse.json({ message: "Invalid loan amount or term" }, { status: 400 });
        }

        // Process the loan application (e.g., save to database, etc.)
        const loan = new Loan({
            userId : new mongoose.Types.ObjectId(userId),
            loanAmount,
            tenure : loanTerm,
        });
        
        await loan.save();
        return NextResponse.json({ message: "Loan application submitted successfully", success : true ,loan }, { status: 201 });
    
        
    } catch (error) {
        console.error("Error applying for loan:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
        
    }
}