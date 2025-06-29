import mongoose from 'mongoose';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        await dbConnect();
        
        const {name, phone, gender, married, education, self_employed, property_area, dependents, applicant_income, finger } = await request.json();

        // Check if all are not null
        if (gender === null || married === null || education === null || self_employed === null || property_area === null || dependents === null || applicant_income === null || finger === null) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        // Check if aadhaar is already registered
        const existingUser = await User.findOne({ finger });
        console.log("Existing User:", existingUser);
        if (existingUser) {
            return NextResponse.json({ message: "User already registered" }, { status: 400 });
        }

        // Create a new user
        const newUser = new User({name, phone, gender, married, education, self_employed, property_area, dependents, applicant_income, finger });
        await newUser.save();

        return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error registering user:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
