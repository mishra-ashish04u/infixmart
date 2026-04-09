import { execute, query } from "../db/mysql.js";

const ADDRESS_SELECT = `
  id,
  name,
  mobile,
  pincode,
  flatHouse,
  areaStreet,
  landmark,
  townCity,
  state,
  country,
  status,
  isDefault,
  userId,
  createdAt,
  updatedAt
`;

function mapAddress(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    _id: row.id,
    status: Boolean(row.status),
    isDefault: Boolean(row.isDefault),
  };
}

async function listAddressesByUserId(userId) {
  const rows = await query(
    `SELECT ${ADDRESS_SELECT}
     FROM Addresses
     WHERE userId = :userId
     ORDER BY isDefault DESC, createdAt DESC`,
    { userId }
  );

  return rows.map(mapAddress);
}

async function findAddressByIdForUser(id, userId) {
  const rows = await query(
    `SELECT ${ADDRESS_SELECT}
     FROM Addresses
     WHERE id = :id AND userId = :userId
     LIMIT 1`,
    { id, userId }
  );

  return mapAddress(rows[0]);
}

async function clearDefaultAddresses(userId) {
  await execute(
    `UPDATE Addresses
     SET isDefault = 0, updatedAt = NOW()
     WHERE userId = :userId`,
    { userId }
  );
}

async function createAddress(payload) {
  const result = await execute(
    `INSERT INTO Addresses (
      name,
      mobile,
      pincode,
      flatHouse,
      areaStreet,
      landmark,
      townCity,
      state,
      country,
      status,
      isDefault,
      userId,
      createdAt,
      updatedAt
    ) VALUES (
      :name,
      :mobile,
      :pincode,
      :flatHouse,
      :areaStreet,
      :landmark,
      :townCity,
      :state,
      :country,
      :status,
      :isDefault,
      :userId,
      NOW(),
      NOW()
    )`,
    {
      ...payload,
      status: payload.status ?? true,
      isDefault: payload.isDefault ? 1 : 0,
    }
  );

  return findAddressByIdForUser(result.insertId, payload.userId);
}

async function updateAddressForUser(id, userId, payload) {
  const entries = Object.entries(payload).filter(([, value]) => value !== undefined);
  if (entries.length === 0) {
    return findAddressByIdForUser(id, userId);
  }

  const setClause = entries
    .map(([key]) => `\`${key}\` = :${key}`)
    .join(", ");

  await execute(
    `UPDATE Addresses
     SET ${setClause}, updatedAt = NOW()
     WHERE id = :id AND userId = :userId`,
    {
      id,
      userId,
      ...Object.fromEntries(entries),
    }
  );

  return findAddressByIdForUser(id, userId);
}

async function deleteAddressForUser(id, userId) {
  const result = await execute(
    `DELETE FROM Addresses
     WHERE id = :id AND userId = :userId`,
    { id, userId }
  );

  return result.affectedRows > 0;
}

export {
  clearDefaultAddresses,
  createAddress,
  deleteAddressForUser,
  findAddressByIdForUser,
  listAddressesByUserId,
  updateAddressForUser,
};
