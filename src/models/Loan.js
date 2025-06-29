import mongoose from "mongoose";

const LoanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    loanAmount: {
        type: Number,
        required: true,
    },
    tenure: { // in Days
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    dueDate : {
        type : Date,
    },
    paidAt: {
        type: Date,
        default: null
    },
    paymentId: {
        type: String,
        default: null
    }
    
}) ;

LoanSchema.pre("save", function(next) {
    if (this.isNew) {
        // Set due date to tenure days from now
        this.dueDate = new Date(Date.now() + this.tenure * 24 * 60 * 60 * 1000);
    }
    // If the loan is being paid, set paidAt to now
    next();
}
);

const Loan = mongoose.models.Loan || mongoose.model("Loan", LoanSchema);
export default Loan;