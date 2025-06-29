import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        await dbConnect();
        const { finger } = await request.json();
        console.log("Received data:", { finger });
        // Check if aadhaar and finger are provided
        if (finger == null) {
            return NextResponse.json({ message: "Fingerprint is required" }, { status: 400 });
        }

        // Check if aadhaar is already registered
        const user = await User.findOne({ finger });
        console.log("Existing User:", user);
        if (!user) {
            return NextResponse.json({ message: "No user found" }, { status: 400 });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
        const response = NextResponse.json({ message: "User logged in successfully", user }, { status: 201 })
        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: true,
            maxAge: 60 * 60 * 2, // 1 day
            secure: process.env.NODE_ENV === 'production',
        });
        return response;
    } catch (error) {
        console.error("Error registering user:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
