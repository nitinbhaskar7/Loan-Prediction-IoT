import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

export async function POST(request) {
    try {
        const {amount} = await request.json();
        const order = await razorpay.orders.create({
            amount: amount * 100, // Amount in paise
            currency: 'INR',
            receipt: `receipt_${new Date().getTime()}`,
        });

        return NextResponse.json({
            success: true,
            orderId: order.id,
            amount: order.amount / 100, // Convert back to rupees
        });

    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to create order',
        }, { status: 500 });
        

    }
}

