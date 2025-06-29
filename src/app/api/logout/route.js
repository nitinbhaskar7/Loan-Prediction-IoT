import { NextResponse } from "next/server";

export async function GET(request){
    try {
        // Clear the cookie by setting its expiration date to a past date
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: -1 // Set maxAge to -1 to delete the cookie
        };

        const response =  NextResponse.json({ message: "User logged out successfully" }, { status: 200 })
        response.cookies.set({
           name: 'token',
            value: '',
            httpOnly: true,
            maxAge: -1, // 1 day
            secure: process.env.NODE_ENV === 'production',
        });
        return response;
    } catch (error) {
        console.error("Error during logout:", error);
        return  NextResponse.json({message : "Internal Server Error"}, { status: 500 });
    }
}