import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { getNoticeById } from "../../services/noticeService";
import NoticeDetailsView from "../../components/notices/NoticeDetails";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import BackButton from "../../components/common/BackButton";

export default function NoticeDetails() {
  const base = useLocation().pathname.startsWith("/citizen") ? "/citizen" : "";
  const { id } = useParams();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    getNoticeById(id)
      .then((res) => setNotice(res.data.data.notice))
      .catch((err) => {
        setNotFound(err.response?.status === 404);
        setError(err.response?.data?.message || "Failed to load notice");
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  if (loading) return <Loader fullScreen />;
  if (error) return (
    <div className="page-container">
      <div className="mb-4"><BackButton to={`${base}/notices`} label="Back to Notices" /></div>
      <ErrorMessage
        message={notFound ? "This notice is no longer available. It may have been removed." : error}
        onRetry={notFound ? undefined : load}
      />
    </div>
  );
  if (!notice) return null;

  return (
    <div className="page-container max-w-3xl">
      <div className="mb-4">
        <BackButton to={`${base}/notices`} label="Back to Notices" />
      </div>
      <NoticeDetailsView notice={notice} />
    </div>
  );
}