import Address from "../models/Address.js";

const normalizeAddressPayload = (body) => ({
  name: body.fullName || body.name || "",
  mobile: body.phone || body.mobile || "",
  pincode: body.pincode || "",
  flatHouse: body.addressLine || body.flatHouse || "",
  areaStreet: body.areaStreet || "",
  landmark: body.landmark || "",
  townCity: body.city || body.townCity || "",
  state: body.state || "",
  country: body.country || "India",
  isDefault: body.isDefault === true,
});

export const getMyAddresses = async (req, res) => {
  try {
    const addresses = await Address.findAll({
      where: { userId: req.userId },
      order: [["isDefault", "DESC"], ["createdAt", "DESC"]],
    });
    return res.status(200).json({ error: false, data: addresses });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
};

export const addMyAddress = async (req, res) => {
  try {
    const payload = normalizeAddressPayload(req.body);
    if (!payload.name || !payload.mobile || !payload.flatHouse || !payload.townCity || !payload.state || !payload.pincode) {
      return res.status(400).json({ error: true, message: "Please fill all required fields" });
    }

    if (payload.isDefault) {
      await Address.update({ isDefault: false }, { where: { userId: req.userId } });
    }

    const newAddress = await Address.create({
      ...payload,
      userId: req.userId,
    });

    return res.status(201).json({ error: false, message: "Address saved successfully!", data: newAddress });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
};

export const updateMyAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!address) {
      return res.status(404).json({ error: true, message: "Address not found" });
    }

    const payload = normalizeAddressPayload(req.body);
    if (!payload.name || !payload.mobile || !payload.flatHouse || !payload.townCity || !payload.state || !payload.pincode) {
      return res.status(400).json({ error: true, message: "Please fill all required fields" });
    }

    if (payload.isDefault) {
      await Address.update({ isDefault: false }, { where: { userId: req.userId } });
    }

    await address.update(payload);
    return res.status(200).json({ error: false, message: "Address updated successfully!", data: address });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
};

export const deleteMyAddress = async (req, res) => {
  try {
    const deleted = await Address.destroy({ where: { id: req.params.id, userId: req.userId } });
    if (!deleted) {
      return res.status(404).json({ error: true, message: "Address not found" });
    }
    return res.status(200).json({ error: false, message: "Address deleted" });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
};

export const addAddress = async (req, res) => {
  try {
    const { name, mobile, pincode, flatHouse, areaStreet, landmark, townCity, state, country, userId, isDefault } = req.body;

    if (!name || !mobile || !pincode || !flatHouse || !areaStreet || !townCity || !state || !country || !userId) {
      return res.status(400).json({ error: true, message: "Please fill all required fields" });
    }

    if (isDefault) {
      await Address.update({ isDefault: false }, { where: { userId } });
    }

    const newAddress = await Address.create({ name, mobile, pincode, flatHouse, areaStreet, landmark, townCity, state, country, userId, isDefault: isDefault || false });

    return res.status(201).json({ error: false, message: "Address added successfully!", data: newAddress });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
};

export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.findAll({
      where: { userId: req.params.userId },
      order: [["isDefault", "DESC"], ["createdAt", "DESC"]],
    });
    return res.status(200).json({ error: false, data: addresses });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.isDefault) {
      const addr = await Address.findByPk(id);
      if (addr) {
        await Address.update({ isDefault: false }, { where: { userId: addr.userId } });
      }
    }

    await Address.update(updateData, { where: { id } });
    const updatedAddress = await Address.findByPk(id);

    if (!updatedAddress) {
      return res.status(404).json({ error: true, message: "Address not found" });
    }

    return res.status(200).json({ error: false, message: "Address updated successfully!", data: updatedAddress });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Address.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ error: true, message: "Address not found" });
    }

    return res.status(200).json({ error: false, message: "Address deleted successfully!" });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
};
