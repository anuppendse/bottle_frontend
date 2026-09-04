import React, { useEffect, useState } from "react";
import client from "../api/client";
import PageHead from "../components/PageHead";
import Field from "../components/Field";
import Segmented from "../components/Segmented";
import Toast from "../components/Toast";
import useToast from "../components/useToast";

export default function Setup() {
  const [manufacturers, setManufacturers] = useState([]);
  const [manufacturerId, setManufacturerId] = useState("");
  const [codeType, setCodeType] = useState("Both");
  const [genLevel, setGenLevel] = useState("Unit-level");
  const [companyName, setCompanyName] = useState("");
  const [gstin, setGstin] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [toast, fireToast] = useToast();

  useEffect(() => {
    client.get("/setup/manufacturers").then((res) => {
      setManufacturers(res.data);
      if (res.data.length) setManufacturerId(res.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!manufacturerId) return;
    client.get(`/setup?manufacturerId=${manufacturerId}`).then((res) => {
      const d = res.data;
      setCodeType(d.defaultCodeType || "Both");
      setGenLevel(d.defaultGenerationLevel || "Unit-level");
      setCompanyName(d.companyName || "");
      setGstin(d.gstin || "");
      setContactEmail(d.contactEmail || "");
      setContactPhone(d.contactPhone || "");
    });
  }, [manufacturerId]);

  async function saveDefaults() {
    try {
      await client.put("/setup", { manufacturerId, defaultCodeType: codeType, defaultGenerationLevel: genLevel });
      fireToast("System defaults saved.");
    } catch (e) {
      fireToast(e.message, "err");
    }
  }

  async function saveProfile() {
    try {
      await client.put("/setup", { manufacturerId, companyName, gstin, contactEmail, contactPhone });
      fireToast("Company profile saved.");
    } catch (e) {
      fireToast(e.message, "err");
    }
  }

  return (
    <>
      <PageHead eyebrow="Admin only" title="Setup"
        desc="System defaults, company profile, and branding for the public verification page — configured separately for each manufacturer." />

      <div className="card mb-5">
        <Field label="Manufacturer" hint="Defaults and company profile below apply only to the selected manufacturer.">
          <select className="input max-w-sm" value={manufacturerId} onChange={(e) => setManufacturerId(e.target.value)}>
            {manufacturers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </Field>
      </div>

      <div className="card mb-5">
        <div className="flex items-center justify-between mb-4.5">
          <div className="panel-title">System defaults</div>
          <span className="text-xs text-faint">Encrypted at rest · applies to this manufacturer's new batches</span>
        </div>
        <div className="flex items-start justify-between gap-10 flex-wrap mb-1">
          <div className="flex-1 min-w-[220px]">
            <div className="text-[12.5px] font-semibold text-ink-soft mb-2.5">Default code type</div>
            <Segmented options={["QR Code", "Barcode", "Both"]} value={codeType} onChange={setCodeType} />
          </div>
          <div className="flex-1 min-w-[220px]">
            <div className="text-[12.5px] font-semibold text-ink-soft mb-2.5">Default generation level</div>
            <Segmented options={["Batch-level", "Unit-level"]} value={genLevel} onChange={setGenLevel} />
          </div>
        </div>
        <div className="mt-2">
          <button className="btn btn-primary" onClick={saveDefaults} disabled={!manufacturerId}>Save defaults</button>
        </div>
      </div>

      <div className="card">
        <div className="panel-title mb-4.5">Company profile</div>
        <div className="grid grid-cols-2 gap-x-5">
          <Field label="Company name"><input className="input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></Field>
          <Field label="GSTIN / registration no."><input className="input lt-mono" value={gstin} onChange={(e) => setGstin(e.target.value)} /></Field>
          <Field label="Contact email"><input className="input" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} /></Field>
          <Field label="Contact phone"><input className="input" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} /></Field>
          <div className="col-span-2">
            <Field label="Public verify page branding" hint="Logo file and accent color — shown on the /verify/:token public page.">
              <input className="input" placeholder="Upload a logo file and choose an accent color" disabled />
            </Field>
          </div>
        </div>
        <button className="btn btn-primary" onClick={saveProfile} disabled={!manufacturerId}>Save profile</button>
      </div>
      <Toast toast={toast} />
    </>
  );
}
