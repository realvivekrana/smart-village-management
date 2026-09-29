import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getMyHousehold,
  saveMyHousehold,
  addFamilyMember,
  deleteFamilyMember,
} from "../../services/householdService";
import useAuth from "../../hooks/useAuth";
import { useVillage } from "../../context/VillageContext";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const FAMILY_TYPES = ["nuclear", "joint", "extended", "other"];
const HOUSE_TYPES = ["kutcha", "semi-pucca", "pucca", "other"];
const GENDERS = ["male", "female", "other", "prefer-not-to-say"];
const RELATIONS = [
  "Self", "Wife", "Husband", "Son", "Daughter", "Father", "Mother",
  "Brother", "Sister", "Grandfather", "Grandmother", "Other",
];

const emptyMember = {
  name: "", relation: "Son", gender: "male", age: "", phone: "",
  occupation: "", bloodGroup: "",
};

const label = (v) => v.replace(/-/g, " ");

export default function MyHousehold() {
  const { user } = useAuth();
  const { villageName } = useVillage();

  const [household, setHousehold] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    householdHeadName: user?.name || "",
    householdHeadPhone: user?.phone || "",
    houseNumber: "", ward: "", familyType: "nuclear", houseType: "pucca",
    isFarmer: false, landArea: "",
    electricityConnection: true, waterConnection: false,
    toiletAvailable: true, gasConnection: false,
    emergencyContactName: "", emergencyContactPhone: "",
  });

  const [memberOpen, setMemberOpen] = useState(false);
  const [member, setMember] = useState(emptyMember);
  const [memberSaving, setMemberSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getMyHousehold()
      .then((res) => {
        const h = res.data?.data || null;
        setHousehold(h);
        if (h) {
          setForm((f) => ({
            ...f,
            ...Object.fromEntries(
              Object.keys(f).map((k) => [k, h[k] ?? f[k]])
            ),
          }));
        }
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load household")
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      payload.landArea = payload.isFarmer && payload.landArea !== ""
        ? Number(payload.landArea)
        : undefined;
      const res = await saveMyHousehold(payload);
      setHousehold(res.data?.data || null);
      toast.success("Household saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save household");
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberSaving(true);
    try {
      const payload = { ...member };
      payload.age = payload.age !== "" ? Number(payload.age) : undefined;
      if (!payload.bloodGroup) delete payload.bloodGroup;
      await addFamilyMember(payload);
      toast.success("Member added");
      setMemberOpen(false);
      setMember(emptyMember);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add member");
    } finally {
      setMemberSaving(false);
    }
  };

  const handleDeleteMember = async () => {
    try {
      await deleteFamilyMember(deleteTarget._id);
      toast.success("Member removed");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not remove member");
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  const members = (household?.members || []).filter((m) => m.isActive !== false);

  return (
    <div className="page-container max-w-3xl">
      <h1 className="section-title mb-1">🏠 Mera Parivar</h1>
      <p className="mb-6 text-sm text-gray-500">
        {villageName} ke records ke liye apne ghar aur parivar ki jaankari.
        {household?.isVerified && (
          <span className="ml-2 badge badge-green">Verified by Panchayat</span>
        )}
      </p>

      <form onSubmit={handleSave} className="card mb-8 space-y-4 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white">Ghar ki jaankari</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            Mukhiya ka naam *
            <input required className="input mt-1" value={form.householdHeadName}
              onChange={(e) => setField("householdHeadName", e.target.value)} />
          </label>
          <label className="text-sm">
            Mukhiya ka phone *
            <input required className="input mt-1" value={form.householdHeadPhone}
              onChange={(e) => setField("householdHeadPhone", e.target.value)} />
          </label>
          <label className="text-sm">
            Ghar number
            <input className="input mt-1" value={form.houseNumber}
              onChange={(e) => setField("houseNumber", e.target.value)} />
          </label>
          <label className="text-sm">
            Ward / Tola
            <input className="input mt-1" value={form.ward}
              onChange={(e) => setField("ward", e.target.value)} />
          </label>
          <label className="text-sm">
            Parivar ka prakar
            <select className="input mt-1" value={form.familyType}
              onChange={(e) => setField("familyType", e.target.value)}>
              {FAMILY_TYPES.map((v) => <option key={v} value={v}>{label(v)}</option>)}
            </select>
          </label>
          <label className="text-sm">
            Ghar ka prakar
            <select className="input mt-1" value={form.houseType}
              onChange={(e) => setField("houseType", e.target.value)}>
              {HOUSE_TYPES.map((v) => <option key={v} value={v}>{label(v)}</option>)}
            </select>
          </label>
          <label className="text-sm">
            Emergency contact naam
            <input className="input mt-1" value={form.emergencyContactName}
              onChange={(e) => setField("emergencyContactName", e.target.value)} />
          </label>
          <label className="text-sm">
            Emergency contact phone
            <input className="input mt-1" value={form.emergencyContactPhone}
              onChange={(e) => setField("emergencyContactPhone", e.target.value)} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          {[
            ["electricityConnection", "Bijli"],
            ["waterConnection", "Nal ka paani"],
            ["toiletAvailable", "Shauchalay"],
            ["gasConnection", "Gas connection"],
            ["isFarmer", "Kisan parivar"],
          ].map(([name, text]) => (
            <label key={name} className="flex items-center gap-2">
              <input type="checkbox" checked={!!form[name]}
                onChange={(e) => setField(name, e.target.checked)} />
              {text}
            </label>
          ))}
        </div>

        {form.isFarmer && (
          <label className="block text-sm sm:w-1/2">
            Zameen (acre)
            <input type="number" min="0" step="0.01" className="input mt-1"
              value={form.landArea}
              onChange={(e) => setField("landArea", e.target.value)} />
          </label>
        )}

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving..." : household ? "Update" : "Save household"}
        </button>
      </form>

      {household && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Parivar ke sadasya ({members.length})
            </h2>
            <button type="button" className="btn-primary" onClick={() => setMemberOpen(true)}>
              ➕ Sadasya jodo
            </button>
          </div>

          {members.length === 0 ? (
            <p className="card p-4 text-sm text-gray-500">Abhi koi sadasya nahi joda gaya.</p>
          ) : (
            <div className="space-y-3">
              {members.map((m) => (
                <div key={m._id} className="card flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{m.name}</p>
                    <p className="text-xs text-gray-500">
                      {m.relation}
                      {m.age ? ` • ${m.age} saal` : ""}
                      {m.bloodGroup ? ` • ${m.bloodGroup}` : ""}
                      {m.occupation ? ` • ${m.occupation}` : ""}
                    </p>
                  </div>
                  <button type="button"
                    className="text-sm text-red-600 hover:underline"
                    onClick={() => setDeleteTarget(m)}>
                    Hatao
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <Modal isOpen={memberOpen} onClose={() => setMemberOpen(false)} title="Sadasya jodo" size="md">
        <form onSubmit={handleAddMember} className="space-y-3">
          <input required className="input" placeholder="Naam *" value={member.name}
            onChange={(e) => setMember({ ...member, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <select className="input" value={member.relation}
              onChange={(e) => setMember({ ...member, relation: e.target.value })}>
              {RELATIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
            <select className="input" value={member.gender}
              onChange={(e) => setMember({ ...member, gender: e.target.value })}>
              {GENDERS.map((g) => <option key={g} value={g}>{label(g)}</option>)}
            </select>
            <input type="number" min="0" max="120" className="input" placeholder="Umar"
              value={member.age}
              onChange={(e) => setMember({ ...member, age: e.target.value })} />
            <input className="input" placeholder="Phone" value={member.phone}
              onChange={(e) => setMember({ ...member, phone: e.target.value })} />
            <input className="input" placeholder="Kaam / Padhai" value={member.occupation}
              onChange={(e) => setMember({ ...member, occupation: e.target.value })} />
            <select className="input" value={member.bloodGroup}
              onChange={(e) => setMember({ ...member, bloodGroup: e.target.value })}>
              <option value="">Blood group</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={memberSaving} className="btn-primary w-full">
            {memberSaving ? "Saving..." : "Add member"}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteMember}
        title="Sadasya hatao?"
        message={`${deleteTarget?.name || "Yeh sadasya"} ko list se hata diya jayega.`}
      />
    </div>
  );
}