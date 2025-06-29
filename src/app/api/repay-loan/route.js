import Loan from '@/models/Loan';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
            const {loanId,paymentId} = await request.json();

            const loan = await Loan.findById(loanId);

            if (!loan) {
                return NextResponse.json({ message: 'Loan not found' }, { status: 404 });
            }
            loan.status = 'paid';
            loan.paidAt = new Date();
            loan.paymentId = paymentId;
            await loan.save();
            return NextResponse.json({ message: 'Loan repaid successfully' }, { status: 200 });

    } catch (error) {
        console.error('Error repaying loan:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}