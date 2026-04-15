import { HttpError } from "../api/http.js";
import {
  clearDefaultAddresses,
  createAddress,
  deleteAddressForUser,
  findAddressByIdForUser,
  listAddressesByUserId,
  updateAddressForUser,
} from "../repositories/addresses.js";

function normalizeAddressPayload(body) {
  return {
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
  };
}

function validateAddress(payload) {
  if (
    !payload.name ||
    !payload.mobile ||
    !payload.flatHouse ||
    !payload.townCity ||
    !payload.state ||
    !payload.pincode
  ) {
    throw new HttpError(400, "Please fill all required fields");
  }
}

async function getMyAddresses(userId) {
  const addresses = await listAddressesByUserId(userId);
  return { error: false, data: addresses };
}

async function addMyAddress(userId, body) {
  const payload = normalizeAddressPayload(body);
  validateAddress(payload);

  if (payload.isDefault) {
    await clearDefaultAddresses(userId);
  }

  const address = await createAddress({
    ...payload,
    userId,
  });

  return {
    error: false,
    message: "Address saved successfully!",
    data: address,
  };
}

async function updateMyAddress(userId, id, body) {
  const existing = await findAddressByIdForUser(id, userId);
  if (!existing) {
    throw new HttpError(404, "Address not found");
  }

  const payload = normalizeAddressPayload(body);
  validateAddress(payload);

  if (payload.isDefault) {
    await clearDefaultAddresses(userId);
  }

  const updated = await updateAddressForUser(id, userId, {
    ...payload,
    isDefault: payload.isDefault ? 1 : 0,
  });

  return {
    error: false,
    message: "Address updated successfully!",
    data: updated,
  };
}

async function deleteMyAddress(userId, id) {
  const deleted = await deleteAddressForUser(id, userId);
  if (!deleted) {
    throw new HttpError(404, "Address not found");
  }

  return {
    error: false,
    message: "Address deleted",
  };
}

export { addMyAddress, deleteMyAddress, getMyAddresses, updateMyAddress };
