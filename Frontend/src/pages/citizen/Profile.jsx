import { useState } from "react";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import { updateMyProfile, changePassword } from "../../services/userService";
import Button from "../../components/common/Button";

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: {
      houseNumber: user?.address?.houseNumber || "",
      street: user?.address?.street || "",
      village: user?.address?.village || "",
      district: user?.address?.district || "",
      state: user?.address?.state || "",
      pincode: user?.address?.pincode || "",
    },
  });
  const [saving, setSaving] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [changingPw, setChangingPw] = useState(false);

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setAddress = (k) => (e) =>
    setForm((f) => ({ ...f, address: { ...f.address, [k]: e.target.value } }));

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateMyProfile(form);
      updateUser(res.data.data.user);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setChangingPw(true);
    try {
      await changePassword(pwForm);
      toast.success("Password changed!");
      setPwForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not change password");
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="page-container max-w-2xl space-y-6">
      <h1 className="section-title">👤 My Profile</h1>

      <form onSubmit={handleProfileSubmit} className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Personal Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={setField("name")} required />
          </div>
          <div className="form-group">
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={setField("phone")} required />
          </div>
          <div className="form-group">
            <label className="label">Email</label>
            <input className="input" value={user?.email || ""} disabled />
          </div>
        </div>

        <h2 className="font-semibold text-gray-900 dark:text-white pt-2">Address</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <input className="input" placeholder="House No." value={form.address.houseNumber} onChange={setAddress("houseNumber")} />
          <input className="input" placeholder="Street" value={form.address.street} onChange={setAddress("street")} />
          <input className="input" placeholder="Village" value={form.address.village} onChange={setAddress("village")} />
          <input className="input" placeholder="District" value={form.address.district} onChange={setAddress("district")} />
          <input className="input" placeholder="State" value={form.address.state} onChange={setAddress("state")} />
          <input className="input" placeholder="Pincode" value={form.address.pincode} onChange={setAddress("pincode")} />
        </div>

        <Button type="submit" loading={saving}>Save Changes</Button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Change Password</h2>
        <div className="form-group">
          <label className="label">Current Password</label>
          <input
            type="password"
            className="input"
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
            required
          />
        </div>
        <div className="form-group">
          <label className="label">New Password</label>
          <input
            type="password"
            className="input"
            value={pwForm.newPassword}
            onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
            required
            minLength={8}
          />
        </div>
        <Button type="submit" variant="secondary" loading={changingPw}>Change Password</Button>
      </form>
    </div>
  );
}