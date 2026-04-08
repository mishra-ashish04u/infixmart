import React, { useContext, useEffect, useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import TextField from "@mui/material/TextField";
import AccountSidebar from "../../components/AccountSidebar";
import { MyContext } from "../../LegacyProviders";
import { putData } from "../../utils/api";
import { Collapse } from "react-collapse";
import { postData } from "../../utils/api";

const MyAccount = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [userId, setUserId] = useState("");
  const [isChangedPasswordFormShow, setIsChangedPasswordFormShow] = useState(false);
  const [formFields, setFormFields] = useState({
    name: "",
    email: "",
    mobile: "",
  });

  const [ChangePassword, setChangePassword] = useState({
    email: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const context = useContext(MyContext);

  useEffect(() => {
    setUserId(context?.userData?._id);
    setFormFields({
      name: context?.userData?.name,
      email: context?.userData?.email,
      mobile: context?.userData?.mobile,
    })

    setChangePassword({
      email: context?.userData?.email,
    })
  }, [context?.userData]);

  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFormFields(() => {
      return {
        ...formFields,
        [name]: value,
      };
    });

    setChangePassword(() => {
      return {
        ...ChangePassword,
        [name]: value,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (formFields.name === "") {
      context.openAlertBox("error", "name field required");
      setIsLoading(false);
      return false;
    }

    if (formFields.email === "") {
      context.openAlertBox("error", "email field required");
      setIsLoading(false);
      return false;
    }

    if (formFields.mobile === "") {
      context.openAlertBox("error", "phone no. required");
      setIsLoading(false);
      return false;
    }

    putData(`/api/user/${userId}`, formFields, { withCredentials: true }).then(
      (res) => {
        if (res?.error !== true) {
          setIsLoading(false);
          context.openAlertBox("success", res?.message);
          setFormFields({
            name: '',
            email: '',
            mobile: '',
          });
        } else {
          context.openAlertBox("error", res?.error);
          setIsLoading(false);
        }
      }
    );
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setIsLoading2(true);

    if (ChangePassword.oldPassword === "") {
      context.openAlertBox("error", "old password field required");
      setIsLoading2(false);
      return false;
    }

    if (ChangePassword.newPassword === "") {
      context.openAlertBox("error", "new password field required");
      setIsLoading2(false);
      return false;
    }

    if (ChangePassword.confirmPassword === "") {
      context.openAlertBox("error", "confirm password field required");
      setIsLoading2(false);
      return false;
    }

    if (ChangePassword.confirmPassword !== ChangePassword.newPassword) {
      context.openAlertBox("error", "confirm password and new password not match");
      setIsLoading2(false);
      return false;
    }

    postData(`/api/user/reset-password`, ChangePassword, { withCredentials: true }).then(
      (res) => {
        if (res?.error !== true) {
          setIsLoading2(false);
          context.openAlertBox("success", res?.message);
          setChangePassword({
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
        } else {
          context.openAlertBox("error", res?.message);
          setIsLoading2(false);
        }
      }
    );
  };

  return (
    <section className="w-full py-10">
      <div className="container flex flex-col md:flex-row gap-5">
        <div className="col1 hidden md:block md:w-[20%]">
          <AccountSidebar />
        </div>

        <div className="col2 w-full md:w-[70%]">
          <div className="p-5 bg-white rounded-md shadow-md card mb-5">
            <div className="flex items-center pb-3">
              <h2 className="pb-0">My Profile</h2>
              <Button className="!ml-auto" onClick={() => setIsChangedPasswordFormShow(!isChangedPasswordFormShow)}>change Password</Button>
            </div>
            <hr />
            <form className="mt-8" action="" onSubmit={handleSubmit}>
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <div className="w-full sm:w-[50%]">
                  <TextField
                    name="name"
                    value={formFields.name}
                    disabled={isLoading === true ? true : false}
                    label="Full Name"
                    variant="outlined"
                    size="small"
                    className="w-full"
                    onChange={onChangeInput}
                  />
                </div>

                <div className="w-full sm:w-[50%]">
                  <TextField
                    name="email"
                    value={formFields.email}
                    disabled={true}
                    label="Email"
                    variant="outlined"
                    size="small"
                    className="w-full"
                    onChange={onChangeInput}
                  />
                </div>
              </div>
              <div className="flex items-center gap-5 mt-4">
                <div className="w-[100%]">
                  <TextField
                    name="mobile"
                    value={formFields.mobile}
                    disabled={isLoading === true ? true : false}
                    label="Phone no."
                    variant="outlined"
                    size="small"
                    className="w-full"
                    onChange={onChangeInput}
                  />
                </div>
              </div>

              <br />

              <div className="flex items-center gap-4">
                <Button
                  type="submit"
                  className="btn-org btn-lg !w-[130px] flex gap-3"
                >
                  {isLoading === true ? (
                    <CircularProgress color="inherit" />
                  ) : (
                    "Save"
                  )}
                </Button>

                <Button className="btn-org btn-border btn-lg !w-[130px]">
                  Cancel
                </Button>
              </div>
            </form>
          </div>

          {
            isChangedPasswordFormShow === true &&
            <Collapse isOpened={isChangedPasswordFormShow}>
              <div className="p-5 bg-white rounded-md shadow-md card">
                <div className="flex items-center pb-3">
                  <h2 className="pb-0">Change Password</h2>
                </div>
                <hr />
                <form className="mt-8" action="" onSubmit={handlePasswordChange}>
                  <div className="flex flex-col sm:flex-row items-start gap-5">
                    <div className="w-full sm:w-[50%]">
                      <TextField
                        name="oldPassword"
                        value={ChangePassword.oldPassword}
                        disabled={isLoading2 === true ? true : false}
                        label="Old Password"
                        variant="outlined"
                        size="small"
                        className="w-full"
                        onChange={onChangeInput}
                      />
                    </div>

                    <div className="w-full sm:w-[50%]">
                      <TextField
                        name="newPassword"
                        value={ChangePassword.newPassword}
                        disabled={isLoading2 === true ? true : false}
                        label="New Password"
                        variant="outlined"
                        size="small"
                        className="w-full"
                        onChange={onChangeInput}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-5 mt-4">
                    <div className="w-[100%]">
                      <TextField
                        name="confirmPassword"
                        value={ChangePassword.confirmPassword}
                        disabled={isLoading2 === true ? true : false}
                        label="Confirm Password"
                        variant="outlined"
                        size="small"
                        className="w-full"
                        onChange={onChangeInput}
                      />
                    </div>
                  </div>

                  <br />

                  <div className="flex items-center gap-4">
                    <Button
                      type="submit"
                      className="btn-org btn-lg !w-[130px] flex gap-3"
                    >
                      {isLoading2 === true ? (
                        <CircularProgress color="inherit" />
                      ) : (
                        "Save"
                      )}
                    </Button>

                    <Button className="btn-org btn-border btn-lg !w-[130px]">
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </Collapse>
          }
        </div>
      </div>
    </section>
  );
};

export default MyAccount;
