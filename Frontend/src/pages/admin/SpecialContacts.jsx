import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createSpecialContact,
  deleteSpecialContact,
  getAllSpecialContacts,
  getSpecialContactMeta,
  updateSpecialContact,
  updateSpecialContactStatus,
} from "../../services/specialContactService";
import { GROUP_SUGGESTIONS, ROLE_SUGGESTIONS } from "../../utils/specialContactPresets";
import { Badge, ErrorBox, Loading, Modal, Page, Table, Toolbar } from "./AdminUI";

const emptyForm = {
  name: "",
  kind: "person",
  isPending: false,
  role: "",
  group: "",
  wardNumber: "",
  area: "",
  phone: "",
  alternatePhone: "",
  whatsapp: "",
  email: "",
  officeAddress: "",
  availability: "",
  about: "",
  photo: "",
  isActive: true,
  isFeatured: false,
  displayOrder: 0,
};

const unique = (list) => [...new Set(list.filter(Boolean))];

function TextField({ label, name, form, set, required, type = "text", placeholder, list, hint }) {
  return (
    <div className="form-group">
      <label className="label" htmlFor={`sc-${name}`}>
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      <input
        id={`sc-${name}`}
        className="input"
        type={type}
        value={form[name] ?? ""}
        onChange={(e) => set(name, e.target.value)}
        required={required}
        placeholder={placeholder}
        list={list}
      />
      {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}

function CheckField({ label, name, form, set }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
      <input
        type="checkbox"
        className="h-4 w-4"
        checked={Boolean(form[name])}
        onChange={(e) => set(name, e.target.checked)}
      />
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}

function ContactForm({ initial, groupOptions, roleOptions, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState({ ...emptyForm, ...initial });
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <datalist id="sc-groups">
        {groupOptions.map((x) => <option key={x} value={x} />)}
      </datalist>
      <datalist id="sc-roles">
        {roleOptions.map((x) => <option key={x} value={x} />)}
      </datalist>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="form-group">
          <label className="label" htmlFor="sc-kind">Type</label>
          <select id="sc-kind" className="input" value={form.kind || "person"} onChange={(e) => set("kind", e.target.value)}>
            <option value="person">Person (name + phone)</option>
            <option value="place">Place (village / locality name only)</option>
          </select>
        </div>
        <TextField
          label={form.kind === "place" ? "Place name" : "Name"}
          name="name"
          form={form}
          set={set}
          required={!form.isPending}
          placeholder={form.kind === "place" ? "e.g. Bhinkudih" : "e.g. Raj Kumar Yadav"}
          hint={form.isPending ? "Can stay empty while verification is pending." : undefined}
        />
        <TextField
          label="Role / Branch heading"
          name="role"
          form={form}
          set={set}
          required
          list="sc-roles"
          placeholder="Mukhiya, MLA, MP, Sachiv, Ward Member..."
          hint="Same role = same branch in the tree. Pick a suggestion or type anything (e.g. Panchayat Villages for places)."
        />
        <TextField
          label="Group (top block on public page)"
          name="group"
          form={form}
          set={set}
          list="sc-groups"
          placeholder="Panchayat, Elected Representatives..."
          hint="e.g. Kakarcholi Gram Panchayat, Jainagar Block. Type a new one to create it. Blocks are ordered by their lowest Display order."
        />
        <TextField label="Ward number" name="wardNumber" form={form} set={set} placeholder="e.g. 5" />
        <TextField label="Area / Tola / Village" name="area" form={form} set={set} placeholder="e.g. Kakarcholi, Ward 5" />
        <TextField label="Phone" name="phone" form={form} set={set} type="tel" placeholder="10-digit mobile" />
        <TextField label="Alternate phone" name="alternatePhone" form={form} set={set} type="tel" />
        <TextField label="WhatsApp number" name="whatsapp" form={form} set={set} type="tel" hint="Fill only if this number is on WhatsApp — a WhatsApp button will then show on the public page." />
        <TextField label="Email" name="email" form={form} set={set} type="email" />
        <TextField label="Available timing" name="availability" form={form} set={set} placeholder="e.g. Mon–Sat, 10 AM – 5 PM" />
        <TextField label="Photo link (optional)" name="photo" form={form} set={set} placeholder="https://..." />
        <TextField label="Display order" name="displayOrder" form={form} set={set} type="number" hint="Smaller number shows first, inside its branch and group." />
        <div className="form-group sm:col-span-2">
          <label className="label" htmlFor="sc-officeAddress">Office / Address</label>
          <textarea id="sc-officeAddress" className="input" rows={2} value={form.officeAddress || ""} onChange={(e) => set("officeAddress", e.target.value)} />
        </div>
        <div className="form-group sm:col-span-2">
          <label className="label" htmlFor="sc-about">Note for villagers (what to contact for)</label>
          <textarea id="sc-about" className="input" rows={3} value={form.about || ""} onChange={(e) => set("about", e.target.value)} placeholder="e.g. Ration card, certificates, panchayat works" />
        </div>
        <CheckField label="Visible to public" name="isActive" form={form} set={set} />
        <CheckField label="Verification pending (name not confirmed yet)" name="isPending" form={form} set={set} />
        <CheckField label="Featured (show first)" name="isFeatured" form={form} set={set} />
      </div>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving..." : initial?._id ? "Update" : "Add contact"}
        </button>
      </div>
    </form>
  );
}

export default function SpecialContacts() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ groups: [], roles: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("");
  const [modal, setModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [list, options] = await Promise.all([
        getAllSpecialContacts({ limit: 500 }),
        getSpecialContactMeta().catch(() => null),
      ]);
      setRows(list.data?.data || []);
      if (options?.data?.data) setMeta(options.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const groupOptions = useMemo(() => unique([...GROUP_SUGGESTIONS, ...meta.groups, ...rows.map((r) => r.group)]), [meta, rows]);
  const roleOptions = useMemo(() => unique([...ROLE_SUGGESTIONS, ...meta.roles, ...rows.map((r) => r.role)]), [meta, rows]);
  const usedGroups = useMemo(() => unique(rows.map((r) => r.group)).sort(), [rows]);

  const save = async (form) => {
    setSaving(true);
    setError("");
    const payload = { ...form, displayOrder: Number(form.displayOrder || 0) };
    delete payload._id;
    delete payload.createdAt;
    delete payload.updatedAt;
    delete payload.__v;
    try {
      if (modal?.item?._id) await updateSpecialContact(modal.item._id, payload);
      else await createSpecialContact(payload);
      setModal(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
      setModal(null);
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (row) => {
    try {
      await updateSpecialContactStatus(row._id, row.isActive === false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not change visibility");
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete ${row.name}? This cannot be undone.`)) return;
    try {
      await deleteSpecialContact(row._id);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const text = search.trim().toLowerCase();
  const filtered = rows.filter((row) => {
    if (group && row.group !== group) return false;
    if (!text) return true;
    return [row.name, row.role, row.group, row.area, row.wardNumber, row.phone]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(text));
  });

  return (
    <Page
      title="Special Contacts"
      subtitle="Add anyone villagers may need — Mukhiya, Sachiv, Ward Member, MLA, MP, ASHA, teacher and more. Changes show on the public page instantly."
      actions={<button className="btn-primary" type="button" onClick={() => setModal({ item: null })}>+ Add Contact</button>}
    >
      <Toolbar
        search={search}
        setSearch={setSearch}
        placeholder="Search name, role, ward, phone..."
        onRefresh={load}
        filters={
          <select className="input" value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="">All groups</option>
            {usedGroups.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        }
      />

      {error ? <ErrorBox message={error} retry={load} /> : null}

      {loading ? (
        <Loading />
      ) : (
        <Table
          empty="No contacts yet. Click “+ Add Contact” to add the first one."
          rows={filtered}
          columns={[
            {
              key: "name",
              label: "Person",
              render: (row) => (
                <div>
                  <p className="font-medium">{row.name || "—"}{row.kind === "place" ? " 📍" : ""}</p>
                  <p className="text-xs text-gray-500">
                    {row.role}{row.wardNumber ? ` · Ward ${row.wardNumber}` : ""}
                  </p>
                </div>
              ),
            },
            { key: "group", label: "Group", render: (row) => <Badge>{row.group || "Other"}</Badge> },
            {
              key: "phone",
              label: "Phone",
              render: (row) => (
                <div>
                  <p>{row.phone || "—"}</p>
                  {row.alternatePhone ? <p className="text-xs text-gray-500">{row.alternatePhone}</p> : null}
                </div>
              ),
            },
            { key: "area", label: "Area", render: (row) => row.area || "—" },
            {
              key: "status",
              label: "Status",
              render: (row) => (
                <div className="flex flex-wrap gap-1">
                  <Badge tone={row.isActive === false ? "gray" : "green"}>{row.isActive === false ? "Hidden" : "Visible"}</Badge>
                  {row.isFeatured ? <Badge tone="yellow">Featured</Badge> : null}
                  {row.isPending ? <Badge tone="yellow">Verification pending</Badge> : null}
                </div>
              ),
            },
            { key: "displayOrder", label: "Order" },
            {
              key: "actions",
              label: "Actions",
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <button className="btn-secondary" type="button" onClick={() => setModal({ item: row })}>Edit</button>
                  <button className="btn-secondary" type="button" onClick={() => toggle(row)}>{row.isActive === false ? "Show" : "Hide"}</button>
                  <button className="btn-danger" type="button" onClick={() => remove(row)}>Delete</button>
                </div>
              ),
            },
          ]}
        />
      )}

      {modal ? (
        <Modal title={modal.item ? "Edit Contact" : "Add Contact"} onClose={() => setModal(null)} wide>
          <ContactForm
            initial={modal.item || {}}
            groupOptions={groupOptions}
            roleOptions={roleOptions}
            onSubmit={save}
            onCancel={() => setModal(null)}
            saving={saving}
          />
        </Modal>
      ) : null}
    </Page>
  );
}