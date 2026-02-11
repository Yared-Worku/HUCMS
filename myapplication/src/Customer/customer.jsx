import React, { useEffect, useState } from "react";
import axios from "axios";

const initialCustomerState = {
  Customer_ID: "",
  Applicant_First_Name_AM: "",
  Applicant_First_Name_EN: "",
  Applicant_Middle_Name_AM: "",
  Applicant_Middle_Name_En: "",
  Applicant_Last_Name_AM: "",
  Applicant_Last_Name_EN: "",
  TIN: "",
  Gender: "",
  SDP_ID: "",
  ID_NO: "",
  Email: "",
  Age: "",
  Mobile_No: "",
  Photo: "",
  Created_By: "",
  Updated_By: "",
  Created_Date: "",
  Updated_Date: "",
  Signiture: "",
};

const Customer = ({ onsave2 }) => {
  const [customer, setCustomer] = useState(initialCustomerState);
  const [departments, setDepartments] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [userid, setUserid] = useState(null);

  // const Username = "dani123";
  const Username = window.__DNN_USER__?.username ?? "Guest";

  // 🔹 fetch userid
  const fetchuserid = async () => {
    try {
      const res = await axios.get(`/GetUserID/${Username}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setUserid(res.data[0].userid);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 fetch departments
  const fetchDepartments = async () => {
    try {
      const res = await axios.get("/studentdepartment"); // endpoint returns depcode + depname
      setDepartments(res.data);
    } catch (err) {
      console.error("Failed to load departments", err);
    }
  };

  // 🔹 fetch customer
  const fetchCustomer = async (id) => {
    try {
      // debugger 
      const res = await axios.get(`/Customer/${id}`);
      const cust = res.data[0];
      if (cust) {
        setCustomer({
          ...initialCustomerState,
          Customer_ID: cust.customer_ID,
          Applicant_First_Name_AM: cust.applicant_First_Name_AM,
          Applicant_First_Name_EN: cust.applicant_First_Name_EN,
          Applicant_Middle_Name_AM: cust.applicant_Middle_Name_AM,
          Applicant_Middle_Name_En: cust.applicant_Middle_Name_En,
          Applicant_Last_Name_AM: cust.applicant_Last_Name_AM,
          Applicant_Last_Name_EN: cust.applicant_Last_Name_EN,
          TIN: cust.tin,
          Gender: cust.gender,
          SDP_ID: cust.sdP_ID,
          ID_NO: cust.iD_NO,
          Email: cust.email,
          Age: cust.age,
          Mobile_No: cust.mobile_No,
          Photo: cust.photo,
          Created_By: cust.created_By,
          Updated_By: cust.updated_By,
          Created_Date: cust.created_Date,
          Updated_Date: cust.updated_Date,
          Signiture: cust.signiture,
        });
        setEditing(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchuserid();
    fetchDepartments(); 
  }, []);

  useEffect(() => {
    if (userid) fetchCustomer(userid);
  }, [userid]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCustomer((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

    const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomer((prev) => ({
        ...prev,
        [field]: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = { ...customer };
    Object.keys(payload).forEach((k) => payload[k] === "" && (payload[k] = null));

    if (!editing) {
      payload.Customer_ID = userid;
      payload.Created_By = userid;
    } else {
      payload.Updated_By = userid;
    }

    try {
      editing
        ? await axios.put(`/Customer/${customer.Customer_ID}`, payload)
        : await axios.post("/Customer", payload);
      setMessage("✅ Saved successfully");
      onsave2(true);
      setEditing(true);
    } catch {
      setMessage("❌ Error saving customer");
    } finally {
      setLoading(false);
    }
  };

   return (
    <div className="container mt-4 mb-5 p-4 border rounded shadow-sm bg-light">
      <h2 className="mb-4">
        {editing ? "Edit Customer Detail" : "Add Customer Detail"}
      </h2>
      {message && <div className="alert alert-info">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Names */}
          <div className="col-md-4 mb-3">
            <label className="form-label">First Name (EN)</label>
            <input
              type="text"
              name="Applicant_First_Name_EN"
              value={customer.Applicant_First_Name_EN}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">First Name (AM)</label>
            <input
              type="text"
              name="Applicant_First_Name_AM"
              value={customer.Applicant_First_Name_AM}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Middle Name (EN)</label>
            <input
              type="text"
              name="Applicant_Middle_Name_En"
              value={customer.Applicant_Middle_Name_En}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Middle Name (AM)</label>
            <input
              type="text"
              name="Applicant_Middle_Name_AM"
              value={customer.Applicant_Middle_Name_AM}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Last Name (EN)</label>
            <input
              type="text"
              name="Applicant_Last_Name_EN"
              value={customer.Applicant_Last_Name_EN}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Last Name (AM)</label>
            <input
              type="text"
              name="Applicant_Last_Name_AM"
              value={customer.Applicant_Last_Name_AM}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          {/* Identification */}
          <div className="col-md-3 mb-3">
            <label className="form-label">TIN</label>
            <input
              type="text"
              name="TIN"
              value={customer.TIN}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="col-md-3 mb-3">
            <label className="form-label">ID No.</label>
            <input
              type="text"
              name="ID_NO"
              value={customer.ID_NO}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="col-md-3 mb-3">
            <label className="form-label">Gender</label>
            <select
              name="Gender"
              value={customer.Gender}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          {/* Contact & Address */}
          <div className="col-md-4 mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="Email"
              value={customer.Email}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        <div className="col-md-4 mb-3">
            <label className="form-label">Age</label>
            <input
              type="number"
              name="Age"
              value={customer.Age}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Mobile No</label>
            <input
              type="text"
              name="Mobile_No"
              value={customer.Mobile_No}
              onChange={handleChange}
              className="form-control"
            />
          </div>
       <div className="col-md-4 mb-3">
            <label className="form-label">Department</label>
            <select
              name="SDP_ID"
              value={customer.SDP_ID}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select your Department</option>
              {departments.map((d) => (
                <option key={d.depcode} value={d.depcode}>
                  {d.depname}
                </option>
              ))}
            </select>
          </div>
          {/* File Uploads */}
          <div className="col-md-6 mb-3">
            <label className="form-label">Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "Photo")}
              className="form-control"
            />
            {customer.Photo && (
              <img
                src={customer.Photo}
                alt="Preview"
                className="mt-2"
                style={{ maxHeight: "100px" }}
              />
            )}
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Signature</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "Signiture")}
              className="form-control"
            />
            {customer.Signiture && (
              <img
                src={customer.Signiture}
                alt="Preview"
                className="mt-2"
                style={{ maxHeight: "100px" }}
              />
            )}
          </div>

          {/* Submit */}
          <div className="col-12 mb-3">
            <button
              type="submit"
              className="actionBtn saveBtn"
              disabled={loading}
            >
              {loading ? "Saving..." : editing ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Customer;
