import React, { useEffect, useState } from "react";
import client from "../api/client";
import PageHead from "../components/PageHead";
import Segmented from "../components/Segmented";
import Toast from "../components/Toast";
import useToast from "../components/useToast";

export default function DispatchConsole() {
  const [tab, setTab] = useState("Activate codes");
  const [batches, setBatches] = useState([]);
  const [batchNo, setBatchNo] = useState("");
  const [history, setHistory] = useState([]);
  const [toast, fireToast] = useToast();
  const [activating, setActivating] = useState(false);

  async function loadBatches() {
    try {
      const res = await client.get("/dispatch/batches");

      setBatches(res.data);

      // Automatically select the first available batch
      // if nothing is currently selected.
      if (!batchNo && res.data.length > 0) {
        setBatchNo(res.data[0].batch);
      }

      // Clear selection if the previously selected batch
      // is no longer READY TO DISPATCH.
      if (
        batchNo &&
        !res.data.some((b) => b.batch === batchNo)
      ) {
        setBatchNo("");
      }
    } catch (err) {
      fireToast(err.message, "err");
    }
  }

  async function loadHistory() {
    try {
      const res = await client.get("/dispatch/history");
      setHistory(res.data);
    } catch (err) {
      fireToast(err.message, "err");
    }
  }

  useEffect(() => {
    loadBatches();
    loadHistory();
  }, []);

  async function activate(e) {
    e.preventDefault();

    if (!batchNo) {
      fireToast("Please select a batch.", "err");
      return;
    }

    try {
      setActivating(true);

      const res = await client.post("/dispatch/activate", {
        batch: batchNo,
      });

      fireToast(
        `${res.data.batch} activated successfully.`
      );

      // Remove the activated batch from the dropdown
      // because it is now ACTIVE.
      await loadBatches();

      await loadHistory();

      setBatchNo("");
    } catch (err) {
      fireToast(err.message, "err");
    } finally {
      setActivating(false);
    }
  }

  return (
    <>
      <PageHead
        eyebrow="Dispatch / warehouse agent"
        title="Dispatch console"
        desc="Activate batches that are ready for physical dispatch."
      />

      <div className="mb-4.5">
        <Segmented
          options={["Activate codes", "Activation history"]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {tab === "Activate codes" ? (
        <div className="card">
          <div className="panel-title mb-5">
            Activate batch
          </div>

          <form
            onSubmit={activate}
            className="flex items-end gap-3"
          >
            <div className="flex-1">
              <label className="block text-[13px] font-semibold text-ink mb-2">
                Batch number
              </label>

              <select
                className="input w-full"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
              >
                <option value="">
                  Select batch number
                </option>

                {batches.map((batch) => (
                  <option
                    key={batch.batch}
                    value={batch.batch}
                  >
                    {batch.batch}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={!batchNo || activating}
            >
              {activating ? "Activating..." : "Activate"}
            </button>
          </form>

          {batches.length === 0 && (
            <div className="hint mt-3">
              No batches are currently ready to dispatch.
            </div>
          )}
        </div>
      ) : (
        <div className="card table-wrap">
          <table className="lt-table">
            <thead>
              <tr>
                <th>Batch</th>
                <th>Product</th>
                <th>Status</th>
                <th>Activated</th>
              </tr>
            </thead>

            <tbody>
              {history.map((h, i) => (
                <tr key={i}>
                  <td className="lt-mono">
                    {h.batch}
                  </td>

                  <td>
                    {h.product || "—"}
                  </td>

                  <td>
                    {h.status}
                  </td>

                  <td>
                    {h.when
                      ? new Date(h.when).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {history.length === 0 && (
            <div className="p-8 text-center text-muted text-sm">
              No activations yet.
            </div>
          )}
        </div>
      )}

      <Toast toast={toast} />
    </>
  );
}