import User from '@/models/User';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import axios from 'axios';
import { dbConnect } from '@/lib/dbConnect';
import { NextResponse } from 'next/server';
import Loan from '@/models/Loan';
export async function POST(request) {

    try {
        await dbConnect();
        const { loanTerm } = await request.json();
        // Get the userId from cookies
        const cookies = request.cookies;
        const token = cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const userId = jwt.verify(token, process.env.JWT_SECRET).userId;
        console.log("User ID from token:", userId);
        
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const user = await User.findById(userId).select('-finger');
        // consoe
        console.log("User data:", user);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Find no of Unpaid loans -> Do aggregation to count unpaid loans match userId and status not equal to paid
        const creditHistory = (await Loan.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    status: { $ne: 'paid' }
                }
            },
            {
                $count: 'unpaidCount'
            }
        ]))[0]?.unpaidCount || 0;

        console.log("Credit history:", creditHistory);



        const result = await axios.post(`${process.env.ESP32IP}/predict`, [user.gender, user.married, user.education, user.self_employed, user.property_area, user.dependents, user.applicant_income, creditHistory != 0 ? 1 : 0, loanTerm]);

        return NextResponse.json({ result: result.data.data }, { status: 200 });

    } catch (error) {
        console.error("Error in prediction:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}