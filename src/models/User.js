import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
        trim: true
    },
    phone : {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    gender : {
        type: Number,
        required: true,
        enum: [0, 1]
    },
    married : {
        type: Number,
        required: true,
        enum: [0, 1]
    },
    education : {
        type: Number,
        required: true,
        enum : [0,1]
    },
    self_employed : {
        type: Number,
        required: true,
        enum: [0, 1]
    },
    property_area : {
        type: Number,
        required: true,
        enum: [0, 1, 2] 
    },
    dependents : {
        type: Number,
        required: true,
        enum : [0, 1, 2, 3]
    },
    applicant_income : {
        type: Number,
        required: true,
        min: 0
    },
    finger : {
        type: String,
        required: true
    }
}) ;

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;