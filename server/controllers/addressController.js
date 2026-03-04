import Address from "../models/Address.js";

export const addAddress = async (req, res) => {
    try {
        const { name, mobile, pincode, flatHouse, areaStreet, landmark, townCity, state, country, userId, isDefault } = req.body;

        if (!name || !mobile || !pincode || !flatHouse || !areaStreet || !townCity || !state || !country || !userId) {
            return res.status(400).json({ error: true, message: "Please fill all required fields" });
        }

        // If the new address is marked as default, unset default status from all existing addresses for this user
        if (isDefault) {
            await Address.updateMany({ userId }, { isDefault: false });
        }

        const newAddress = new Address({
            name,
            mobile,
            pincode,
            flatHouse,
            areaStreet,
            landmark,
            townCity,
            state,
            country,
            userId,
            isDefault: isDefault || false
        });

        await newAddress.save();

        res.status(201).json({
            error: false,
            message: "Address added successfully!",
            data: newAddress
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
};

export const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ userId: req.params.userId }).sort({ isDefault: -1, createdAt: -1 });
        res.status(200).json({
            error: false,
            data: addresses
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
};

export const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // If the updated address is marked as default, unset default status from all other addresses for this user
        if (updateData.isDefault) {
            const addressToUpdate = await Address.findById(id);
            if (addressToUpdate) {
                await Address.updateMany({ userId: addressToUpdate.userId, _id: { $ne: id } }, { isDefault: false });
            }
        }

        const updatedAddress = await Address.findByIdAndUpdate(
            id,
            updateData,
            { new: true } // Returns the modified document rather than the original
        );

        if (!updatedAddress) {
            return res.status(404).json({ error: true, message: "Address not found" });
        }

        res.status(200).json({
            error: false,
            message: "Address updated successfully!",
            data: updatedAddress
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAddress = await Address.findByIdAndDelete(id);

        if (!deletedAddress) {
            return res.status(404).json({ error: true, message: "Address not found" });
        }

        res.status(200).json({
            error: false,
            message: "Address deleted successfully!"
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
};
