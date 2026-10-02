import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import { useLanguage } from "../../context/LanguageContext";
import {
  updateMyProfile,
  changePassword,
  uploadAvatar,
  removeAvatar,
} from "../../services/userService";
import { compressImage } from "../../utils/image";
import Button from "../../components/common/Button";
import BackButton from "../../components/common/BackButton";
import Avatar from "../../components/common/Avatar";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

const buildForm = (user) => ({
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

// Admin aur citizen dono isi page ko use karte hain
export default function Profile() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();

  const dashboardPath = user?.role === "admin" ? "/admin/dashboard" : "/citizen/dashboard";

  const [form, setForm] = useState(() => buildForm(user));
  const [saved, setSaved] = useState(() => JSON.stringify(buildForm(user)));
  const [saving, setSaving] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [changingPw, setChangingPw] = useState(false);

  // Photo
  const fileRef = useRef(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  // Preview ka temporary URL memory se hatao
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview]
  );

  const isDirty = JSON.stringify(form) !== saved;

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setAddress = (k) => (e) =>
    setForm((f) => ({ ...f, address: { ...f.address, [k]: e.target.value } }));

  const handlePhotoPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // same file dobara chunne par bhi event aaye
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(t("profilePage.badType", "Only JPG, PNG or WEBP photos are allowed"));
      return;
    }

    setUploading(true);
    try {
      const ready = await compressImage(file);

      if (ready.size > MAX_BYTES) {
        toast.error(t("profilePage.tooBig", "Photo is too large (max 5 MB)"));
        return;
      }

      setPreview(URL.createObjectURL(ready));

      const res = await uploadAvatar(ready);
      updateUser(res.data.data.user);
      toast.success(t("profilePage.photoUpdated", "Photo updated!"));
    } catch (err) {
      toast.error(
        err.response?.data?.message || t("profilePage.uploadFailed", "Could not upload the photo")
      );
    } finally {
      setPreview("");
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setRemoving(true);
    try {
      const res = await removeAvatar();
      updateUser(res.data.data.user);
      toast.success(t("profilePage.photoRemoved", "Photo removed"));
      setConfirmRemove(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not remove photo");
    } finally {
      setRemoving(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      toast.error(t("profilePage.invalidPhone", "Enter a valid 10-digit mobile number"));
      return;
    }
    if (form.address.pincode && !/^\d{6}$/.test(form.address.pincode.trim())) {
      toast.error(t("profilePage.invalidPincode", "Enter a valid 6-digit pincode"));
      return;
    }

    setSaving(true);
    try {
      const res = await updateMyProfile(form);
      const updated = res.data.data.user;
      updateUser(updated);
      const next = buildForm(updated);
      setForm(next);
      setSaved(JSON.stringify(next));
      toast.success(t("profile.updated", "Profile updated!"));
    } catch (err) {
      const first = err.response?.data?.errors?.[0]?.message;
      toast.error(first || err.response?.data?.message || "Update failed");
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

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short" })
    : "";

  return (
    <div className="page-container max-w-2xl space-y-6">
      <div>
        <BackButton
          to={dashboardPath}
          label={t("profilePage.backDashboard", "Back to Dashboard")}
        />
      </div>
      <h1 className="section-title">👤 {t("profilePage.title", "My Profile")}</h1>

      {/* Photo + identity */}
      <div className="card p-6">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          <div className="relative">
            {preview ? (
              <img
                src={preview}
                alt=""
                className="h-32 w-32 rounded-full object-cover opacity-70"
              />
            ) : (
              <Avatar user={user} size="xl" zoom />
            )}

            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/40 border-t-white" />
              </div>
            )}

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              aria-label={t("profilePage.changePhoto", "Change photo")}
              className="absolute bottom-0 right-0 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-primary-600 text-lg text-white shadow hover:bg-primary-700 disabled:opacity-60 dark:border-gray-800"
            >
              📷
            </button>
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="truncate text-lg font-semibold text-gray-900 dark:text-white">
              {user?.name}
            </p>
            <p className="truncate text-sm text-gray-500">{user?.email}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="badge-blue capitalize">
                {t(`roles.${user?.role}`, user?.role?.replace("_", " "))}
              </span>
              {memberSince && (
                <span className="text-xs text-gray-400">
                  {t("profilePage.memberSince", "Member since")} {memberSince}
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Button
                size="sm"
                onClick={() => fileRef.current?.click()}
                loading={uploading}
              >
                {user?.avatar
                  ? t("profilePage.changePhoto", "Change photo")
                  : t("profilePage.addPhoto", "Add photo")}
              </Button>
              {user?.avatar && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setConfirmRemove(true)}
                  disabled={uploading}
                >
                  {t("profilePage.removePhoto", "Remove photo")}
                </Button>
              )}
            </div>
            {user?.avatar && (
              <p className="mt-2 text-xs text-gray-400">
                {t("profilePage.tapToView", "Tap the photo to see it larger")}
              </p>
            )}
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handlePhotoPick}
        />
      </div>

      <form onSubmit={handleProfileSubmit} className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Personal Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label">Name</label>
            <input
              className="input"
              value={form.name}
              onChange={setField("name")}
              minLength={2}
              maxLength={50}
              required
            />
          </div>
          <div className="form-group">
            <label className="label">Phone</label>
            <input
              className="input"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={form.phone}
              onChange={setField("phone")}
              required
            />
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
          <input className="input" placeholder="Pincode" inputMode="numeric" maxLength={6} value={form.address.pincode} onChange={setAddress("pincode")} />
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={saving} disabled={!isDirty}>
            Save Changes
          </Button>
          {!isDirty && (
            <span className="text-xs text-gray-400">
              {t("profilePage.noChanges", "No changes to save")}
            </span>
          )}
        </div>
      </form>

      <form onSubmit={handlePasswordSubmit} className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Change Password</h2>
        <div className="form-group">
          <label className="label">Current Password</label>
          <input
            type="password"
            className="input"
            autoComplete="current-password"
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
            autoComplete="new-password"
            value={pwForm.newPassword}
            onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
            required
            minLength={8}
          />
          <p className="mt-1 text-xs text-gray-400">
            Min 8 characters, ek capital letter aur ek number.
          </p>
        </div>
        <Button type="submit" variant="secondary" loading={changingPw}>Change Password</Button>
      </form>

      <ConfirmDialog
        isOpen={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        onConfirm={handleRemovePhoto}
        loading={removing}
        title={t("profilePage.removeTitle", "Remove photo?")}
        message={t("profilePage.removeConfirm", "Your profile photo will be removed.")}
        confirmLabel={t("profilePage.removePhoto", "Remove photo")}
      />
    </div>
  );
}