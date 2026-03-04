import React, { useContext, useEffect, useState } from "react";
import AccountSidebar from "../../components/AccountSidebar";
import { Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import { MyContext } from "../../App";
import { useNavigate } from "react-router-dom";
import { postData, putData, getData } from "../../utils/api";
import { Collapse } from "react-collapse";
import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";
import { IoCloseSharp } from "react-icons/io5";

const MyAddress = () => {
    const [isLoading3, setIsLoading3] = useState(false);
    const [isAddAddressFormShow, setIsAddAddressFormShow] = useState(false);
    const [addressList, setAddressList] = useState([]);

    // Address Action States
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewData, setViewData] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [editId, setEditId] = useState(null);

    const [addressFields, setAddressFields] = useState({
        name: "",
        mobile: "",
        pincode: "",
        flatHouse: "",
        areaStreet: "",
        landmark: "",
        townCity: "",
        state: "",
        country: "India",
        isDefault: false,
    });

    const context = useContext(MyContext);
    const history = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("accesstoken");
        if (!token) {
            history("/");
        }
    }, [context?.isLogin, history]);

    useEffect(() => {
        if (context?.userData?._id) {
            fetchAddresses(context?.userData?._id);
        }
    }, [context?.userData]);

    const fetchAddresses = (userId) => {
        if (!userId) return;
        getData(`/api/address/${userId}`).then((res) => {
            if (res?.error === false) {
                setAddressList(res.data);
            }
        });
    };

    const onChangeAddressInput = (e) => {
        const { name, value } = e.target;
        setAddressFields({
            ...addressFields,
            [name]: value,
        });
    };

    const handleEditBtnClick = (addr) => {
        setEditId(addr._id);
        setAddressFields({
            name: addr.name,
            mobile: addr.mobile,
            pincode: addr.pincode,
            flatHouse: addr.flatHouse,
            areaStreet: addr.areaStreet,
            landmark: addr.landmark,
            townCity: addr.townCity,
            state: addr.state,
            country: addr.country,
            isDefault: addr.isDefault || false,
        });
        setIsAddAddressFormShow(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteBtnClick = (id) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const handleViewBtnClick = (addr) => {
        setViewData(addr);
        setIsViewModalOpen(true);
    };

    const confirmDeleteAddress = () => {
        setIsLoading3(true);
        getData(`/api/address/${deleteId}`, null, { method: "DELETE" }).then((res) => {
            setIsLoading3(false);
            if (res?.error === false) {
                context.openAlertBox("success", "Address deleted successfully");
                setIsDeleteModalOpen(false);
                setDeleteId(null);
                fetchAddresses(context?.userData?._id);
            } else {
                context.openAlertBox("error", res?.message || "Failed to delete address");
            }
        });
    };

    const handleAddAddress = (e) => {
        e.preventDefault();
        setIsLoading3(true);

        const requiredFields = ["name", "mobile", "pincode", "flatHouse", "areaStreet", "townCity", "state", "country"];
        for (let field of requiredFields) {
            if (addressFields[field] === "") {
                context.openAlertBox("error", `Please fill all required fields: ${field} is missing`);
                setIsLoading3(false);
                return;
            }
        }

        const payload = {
            ...addressFields,
            userId: context?.userData?._id
        };

        if (editId) {
            putData(`/api/address/${editId}`, payload, { withCredentials: true }).then(
                (res) => {
                    setIsLoading3(false);
                    if (res?.error !== true) {
                        context.openAlertBox("success", "Address updated successfully");
                        setEditId(null);
                        setAddressFields({
                            name: "",
                            mobile: "",
                            pincode: "",
                            flatHouse: "",
                            areaStreet: "",
                            landmark: "",
                            townCity: "",
                            state: "",
                            country: "India",
                            isDefault: false,
                        });
                        setIsAddAddressFormShow(false);
                        fetchAddresses(context?.userData?._id);
                    } else {
                        context.openAlertBox("error", res?.message || "Failed to update address");
                    }
                }
            );
        } else {
            postData(`/api/address/add`, payload, { withCredentials: true }).then(
                (res) => {
                    setIsLoading3(false);
                    if (res?.error !== true) {
                        context.openAlertBox("success", "Address added successfully");
                        setAddressFields({
                            name: "",
                            mobile: "",
                            pincode: "",
                            flatHouse: "",
                            areaStreet: "",
                            landmark: "",
                            townCity: "",
                            state: "",
                            country: "India",
                            isDefault: false,
                        });
                        setIsAddAddressFormShow(false);
                        fetchAddresses(context?.userData?._id);
                    } else {
                        context.openAlertBox("error", res?.message || "Failed to add address");
                    }
                }
            );
        }
    };

    return (
        <section className="w-full py-10">
            <div className="container flex gap-5">
                <div className="col1 w-[20%]">
                    <AccountSidebar />
                </div>

                <div className="col2 w-[80%]">
                    <div className="p-5 bg-white rounded-md shadow-md card mb-5">
                        <div className="flex items-center justify-between pb-3">
                            <h2 className="pb-0 text-[20px] font-[600]">My Addresses</h2>
                            <Button
                                className="btn-blue btn-sm"
                                onClick={() => {
                                    if (isAddAddressFormShow && editId) {
                                        setEditId(null);
                                        setAddressFields({
                                            name: "", mobile: "", pincode: "", flatHouse: "", areaStreet: "", landmark: "", townCity: "", state: "", country: "India",
                                        });
                                    }
                                    setIsAddAddressFormShow(!isAddAddressFormShow);
                                }}
                            >
                                {isAddAddressFormShow ? "Close Address Form" : "Add Address"}
                            </Button>
                        </div>
                        <hr />
                        <br />

                        <Collapse isOpened={isAddAddressFormShow}>
                            <div className="card bg-gray-50 border border-gray-200 rounded-md p-6 mb-8" id="address-form">
                                <h3 className="text-[18px] font-[600] mb-4">
                                    {editId ? "Edit Address" : "Add Address"}
                                </h3>

                                <form className="form" onSubmit={handleAddAddress}>
                                    <div className="grid grid-cols-1 gap-5 mb-5">
                                        <div className="col">
                                            <h3 className="text-[14px] font-[500] mb-1">Country/Region</h3>
                                            <select
                                                name="country"
                                                value={addressFields.country}
                                                onChange={onChangeAddressInput}
                                                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm px-3 text-sm bg-[#fafafa]"
                                            >
                                                <option value="India">India</option>
                                                <option value="USA">USA</option>
                                                <option value="UK">UK</option>
                                                <option value="Canada">Canada</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 mb-5">
                                        <div className="col">
                                            <h3 className="text-[14px] font-[500] mb-1">Full name (First and Last name)</h3>
                                            <input
                                                type="text"
                                                name="name"
                                                value={addressFields.name}
                                                onChange={onChangeAddressInput}
                                                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-[#fafafa]"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 mb-5">
                                        <div className="col">
                                            <h3 className="text-[14px] font-[500] mb-1">Mobile number</h3>
                                            <input
                                                type="text"
                                                name="mobile"
                                                value={addressFields.mobile}
                                                onChange={onChangeAddressInput}
                                                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-[#fafafa]"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 mb-5">
                                        <div className="col">
                                            <h3 className="text-[14px] font-[500] mb-1">Pincode</h3>
                                            <input
                                                type="text"
                                                name="pincode"
                                                value={addressFields.pincode}
                                                onChange={onChangeAddressInput}
                                                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-[#fafafa]"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 mb-5">
                                        <div className="col">
                                            <h3 className="text-[14px] font-[500] mb-1">Flat, House no., Building, Company, Apartment</h3>
                                            <input
                                                type="text"
                                                name="flatHouse"
                                                value={addressFields.flatHouse}
                                                onChange={onChangeAddressInput}
                                                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-[#fafafa]"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 mb-5">
                                        <div className="col">
                                            <h3 className="text-[14px] font-[500] mb-1">Area, Street, Sector, Village</h3>
                                            <input
                                                type="text"
                                                name="areaStreet"
                                                value={addressFields.areaStreet}
                                                onChange={onChangeAddressInput}
                                                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-[#fafafa]"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 mb-5">
                                        <div className="col">
                                            <h3 className="text-[14px] font-[500] mb-1">Landmark</h3>
                                            <input
                                                type="text"
                                                name="landmark"
                                                value={addressFields.landmark}
                                                onChange={onChangeAddressInput}
                                                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-[#fafafa]"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-5 mb-8">
                                        <div className="col">
                                            <h3 className="text-[14px] font-[500] mb-1">Town/City</h3>
                                            <input
                                                type="text"
                                                name="townCity"
                                                value={addressFields.townCity}
                                                onChange={onChangeAddressInput}
                                                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-[#fafafa]"
                                            />
                                        </div>
                                        <div className="col">
                                            <h3 className="text-[14px] font-[500] mb-1">State</h3>
                                            <select
                                                name="state"
                                                value={addressFields.state}
                                                onChange={onChangeAddressInput}
                                                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm px-3 text-sm bg-[#fafafa]"
                                            >
                                                <option value="">Choose a state</option>
                                                <option value="Andhra Pradesh">Andhra Pradesh</option>
                                                <option value="Maharashtra">Maharashtra</option>
                                                <option value="Karnataka">Karnataka</option>
                                                <option value="Tamil Nadu">Tamil Nadu</option>
                                                {/* Add more states... */}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 mb-8">
                                        <div className="col flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                name="isDefault"
                                                id="isDefault"
                                                checked={addressFields.isDefault}
                                                onChange={(e) => setAddressFields({ ...addressFields, isDefault: e.target.checked })}
                                                className="w-[18px] h-[18px] cursor-pointer"
                                            />
                                            <label htmlFor="isDefault" className="text-[15px] font-[500] cursor-pointer text-gray-800 tracking-wide">Make this my default address</label>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-4 w-full">
                                        <Button
                                            type="submit"
                                            className="btn-blue btn-lg !w-[150px]"
                                            disabled={isLoading3}
                                        >
                                            {isLoading3 ? <CircularProgress size={24} color="inherit" /> : "Save"}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </Collapse>

                        {addressList?.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                {addressList.map((addr, index) => (
                                    <div key={index} className="border border-gray-200 rounded-md p-5 shadow-sm bg-gray-50 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-[16px] font-[600]">{addr.name}</h3>
                                                    {addr.isDefault && (
                                                        <span className="bg-blue-100 text-blue-800 text-[11px] font-[600] px-2 py-[2px] rounded uppercase tracking-wider">Default</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <IconButton size="small" sx={{ color: '#4b5563', '&:hover': { color: '#2563eb', bgcolor: '#eff6ff' } }} onClick={() => handleViewBtnClick(addr)}><FiEye className="text-[18px]" /></IconButton>
                                                    <IconButton size="small" sx={{ color: '#4b5563', '&:hover': { color: '#059669', bgcolor: '#ecfdf5' } }} onClick={() => handleEditBtnClick(addr)}><FiEdit className="text-[18px]" /></IconButton>
                                                    <IconButton size="small" sx={{ color: '#4b5563', '&:hover': { color: '#dc2626', bgcolor: '#fef2f2' } }} onClick={() => handleDeleteBtnClick(addr._id)}><FiTrash2 className="text-[18px]" /></IconButton>
                                                </div>
                                            </div>
                                            <p className="text-[14px] text-gray-700 mb-1">
                                                <span className="font-[500] text-gray-900">Mobile:</span> {addr.mobile}
                                            </p>
                                            <p className="text-[14px] text-gray-700 leading-relaxed max-w-[90%]">
                                                {addr.flatHouse}, {addr.areaStreet}<br />
                                                {addr.landmark ? `${addr.landmark}, ` : ""}
                                                {addr.townCity}, {addr.state} - {addr.pincode}<br />
                                                {addr.country}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-5">No addresses saved yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* View Modal */}
            <Dialog open={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle className="flex items-center justify-between">
                    <span className="font-[600]">View Address</span>
                    <IconButton onClick={() => setIsViewModalOpen(false)}><IoCloseSharp /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {viewData && (
                        <div className="flex flex-col gap-3">
                            {viewData.isDefault && (
                                <div className="mb-1"><span className="bg-blue-100 text-blue-800 text-[12px] font-[600] px-2 py-1 rounded uppercase tracking-wider">Default Address</span></div>
                            )}
                            <p className="text-[15px]"><b className="font-[600]">Name:</b> {viewData.name}</p>
                            <p className="text-[15px]"><b className="font-[600]">Mobile:</b> {viewData.mobile}</p>
                            <p className="text-[15px]"><b className="font-[600]">Flat/House No:</b> {viewData.flatHouse}</p>
                            <p className="text-[15px]"><b className="font-[600]">Street/Area:</b> {viewData.areaStreet}</p>
                            <p className="text-[15px]"><b className="font-[600]">Landmark:</b> {viewData.landmark || "N/A"}</p>
                            <p className="text-[15px]"><b className="font-[600]">Town/City:</b> {viewData.townCity}</p>
                            <p className="text-[15px]"><b className="font-[600]">State:</b> {viewData.state}</p>
                            <p className="text-[15px]"><b className="font-[600]">Pincode:</b> {viewData.pincode}</p>
                            <p className="text-[15px]"><b className="font-[600]">Country:</b> {viewData.country}</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this address? This action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDeleteModalOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={confirmDeleteAddress} color="error" variant="contained" disabled={isLoading3}>
                        {isLoading3 ? <CircularProgress size={20} color="inherit" /> : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </section>
    );
};

export default MyAddress;
