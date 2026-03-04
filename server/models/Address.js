import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: "",
    },
    mobile: {
      type: String,
      required: true,
      default: "",
    },
    pincode: {
      type: String,
      required: true,
      default: "",
    },
    flatHouse: {
      type: String,
      required: true,
      default: "",
    },
    areaStreet: {
      type: String,
      required: true,
      default: "",
    },
    landmark: {
      type: String,
      default: "",
    },
    townCity: {
      type: String,
      required: true,
      default: "",
    },
    state: {
      type: String,
      required: true,
      default: "",
    },
    country: {
      type: String,
      required: true,
      default: "India",
    },
    status: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: 'User'
    },
  },
  { timestamps: true }
);

export default mongoose.model("Address", AddressSchema);
