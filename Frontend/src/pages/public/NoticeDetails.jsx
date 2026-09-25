import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getNoticeById } from "../../services/noticeService";
import NoticeDetailsView from "../../components/notices/NoticeDetails";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

export default function NoticeDetails() {
  const { id } = useParams();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getNoticeById(id)
      .then((res) => setNotice(res.data.data.notice))
      .catch((err) => setError(err.response?.data?.message || "Failed to load notice"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  if (loading) return <Loader fullScreen />;
  if (error) return <div className="page-container"><ErrorMessage message={error} onRetry={load} /></div>;
  if (!notice) return null;

  return (
    <div className="page-container max-w-3xl">
      <NoticeDetailsView notice={notice} />
    </div>
  );
}