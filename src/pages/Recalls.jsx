import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import client from "../api/client";
import PageHead from "../components/PageHead";
import EmptyState from "../components/EmptyState";

export default function Recalls() {
  const navigate = useNavigate();
  const [recalls, setRecalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get("/recalls").then((res) => setRecalls(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHead title="Recall management" desc="Every recall ever issued, with the reason and who issued it." />
      {!loading && recalls.length === 0 ? (
        <div className="card"><EmptyState icon={AlertTriangle} title="No recalls issued" desc="Recalled batches will appear here as soon as one is confirmed from Batch Management." /></div>
      ) : (
        <div className="card table-wrap">
          <table className="lt-table">
            <thead><tr><th>Batch number</th><th>Product</th><th>Manufacturer</th><th>Reason</th><th>Recalled by</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {recalls.map((r) => (
                <tr key={r.batch}>
                  <td className="lt-mono">{r.batch}</td>
                  <td>{r.productName}</td>
                  <td>{r.manufacturer}</td>
                  <td style={{ maxWidth: 260 }}>{r.reason}</td>
                  <td>{r.recalledBy}</td>
                  <td>{r.date ? r.date.slice(0, 10) : "—"}</td>
                  <td><button className="row-link" onClick={() => navigate(`/batches/${r.batch}`)}>View →</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
