import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  getBusinessById,
  getBusinessReviews,
  createReview,
} from "../../services/businessService";

import BusinessDetailsView from "../../components/business/BusinessDetails";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import Button from "../../components/common/Button";

import useAuth from "../../hooks/useAuth";
import { formatRelative } from "../../utils/formatDate";

export default function BusinessDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const [businessResponse, reviewsResponse] = await Promise.all([
        getBusinessById(id),
        getBusinessReviews(id, {
          page: 1,
          limit: 20,
        }),
      ]);

      setBusiness(businessResponse.data.data.business);
      setReviews(reviewsResponse.data.data.reviews || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load business information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!comment.trim()) {
      toast.error("Please write a review.");
      return;
    }

    setSubmitting(true);

    try {
      await createReview(id, {
        rating: Number(rating),
        comment: comment.trim(),
      });

      toast.success("Review submitted successfully!");

      setComment("");
      setRating(5);

      await load();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Could not submit your review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* -------------------------------------------------
     Loading
  ------------------------------------------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Loader fullScreen />
      </div>
    );
  }

  /* -------------------------------------------------
     Error
  ------------------------------------------------- */

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <ErrorMessage message={error} onRetry={load} />
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-20">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-4xl dark:bg-gray-800">
            🏪
          </div>

          <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
            Business not found
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            The business you're looking for may have been removed
            or is no longer available.
          </p>

          <Link
            to="/businesses"
            className="mt-6 inline-flex rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            ← Back to Businesses
          </Link>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------
     Review statistics
  ------------------------------------------------- */

  const averageRating =
    Number(business?.averageRating || business?.rating || 0);

  const reviewCount =
    Number(
      business?.reviewCount ??
        business?.reviewsCount ??
        reviews.length
    );

  const fullStars = Math.floor(averageRating);
  const hasHalfStar =
    averageRating - fullStars >= 0.5;

  const ratingStars = Array.from({ length: 5 }, (_, index) => {
    if (index < fullStars) return "★";
    if (index === fullStars && hasHalfStar) return "⯨";
    return "☆";
  });

  /* -------------------------------------------------
     Render
  ------------------------------------------------- */

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* =================================================
          TOP HEADER / BREADCRUMB
      ================================================= */}

      <section className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">

          <div className="flex flex-wrap items-center gap-2 text-sm">

            <Link
              to="/"
              className="text-gray-500 transition hover:text-primary-600 dark:text-gray-400"
            >
              Home
            </Link>

            <span className="text-gray-300 dark:text-gray-600">
              /
            </span>

            <Link
              to="/businesses"
              className="text-gray-500 transition hover:text-primary-600 dark:text-gray-400"
            >
              Businesses
            </Link>

            <span className="text-gray-300 dark:text-gray-600">
              /
            </span>

            <span className="font-medium text-gray-900 dark:text-white">
              {business.name || "Business Details"}
            </span>

          </div>

        </div>
      </section>

      {/* =================================================
          BUSINESS HERO
      ================================================= */}

      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-700">

        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-indigo-300/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">

          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">

            <div>

              {/* Category */}
              {business.category && (
                <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur">
                  🏪 {business.category}
                </span>
              )}

              <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {business.name}
              </h1>

              {business.description && (
                <p className="mt-4 max-w-3xl text-sm leading-7 text-primary-50 sm:text-base">
                  {business.description}
                </p>
              )}

              {/* Rating */}
              <div className="mt-6 flex flex-wrap items-center gap-4">

                <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 backdrop-blur">
                  <span className="text-lg tracking-wide text-yellow-300">
                    {ratingStars.join("")}
                  </span>

                  <span className="font-bold text-white">
                    {averageRating
                      ? averageRating.toFixed(1)
                      : "New"}
                  </span>
                </div>

                <span className="text-sm text-primary-100">
                  {reviewCount}{" "}
                  {reviewCount === 1 ? "review" : "reviews"}
                </span>

              </div>

            </div>

            {/* Quick action */}
            <div className="flex flex-wrap gap-3 lg:justify-end">

              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-primary-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-primary-50"
                >
                  📞 Call Business
                </a>
              )}

              {business.website && (
                <a
                  href={
                    business.website.startsWith("http")
                      ? business.website
                      : `https://${business.website}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  🌐 Website
                </a>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">

          {/* =================================================
              LEFT CONTENT
          ================================================= */}

          <div className="min-w-0 space-y-8">

            {/* Business Details */}
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

              <div className="border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-xl dark:bg-primary-900/30">
                    🏪
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      Business Information
                    </h2>

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Details about this local business
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-7">
                <BusinessDetailsView business={business} />
              </div>

            </section>

            {/* =================================================
                REVIEWS
            ================================================= */}

            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

              {/* Review header */}
              <div className="border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-7">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50 text-xl dark:bg-yellow-900/20">
                        ⭐
                      </div>

                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                          Customer Reviews
                        </h2>

                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {reviews.length}{" "}
                          {reviews.length === 1
                            ? "review"
                            : "reviews"}{" "}
                          from the community
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Rating summary */}
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800">

                    <div className="text-center">
                      <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
                        {averageRating
                          ? averageRating.toFixed(1)
                          : "—"}
                      </p>

                      <div className="text-sm tracking-wide text-yellow-400">
                        {ratingStars.join("")}
                      </div>
                    </div>

                    <div className="h-10 w-px bg-gray-200 dark:bg-gray-700" />

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <p>Community rating</p>
                      <p className="mt-1 font-medium text-gray-700 dark:text-gray-300">
                        {reviewCount} reviews
                      </p>
                    </div>

                  </div>

                </div>

              </div>

              <div className="p-5 sm:p-7">

                {/* =================================================
                    REVIEW FORM
                ================================================= */}

                {user ? (
                  <form
                    onSubmit={handleReviewSubmit}
                    className="mb-8 rounded-2xl border border-primary-100 bg-primary-50/50 p-5 dark:border-primary-900/30 dark:bg-primary-900/10 sm:p-6"
                  >

                    <div className="mb-5">
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        Share your experience
                      </h3>

                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Your review can help other villagers discover
                        good local businesses.
                      </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-[150px_1fr]">

                      {/* Rating */}
                      <div>
                        <label
                          htmlFor="business-rating"
                          className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                        >
                          Your Rating
                        </label>

                        <select
                          id="business-rating"
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          value={rating}
                          onChange={(event) =>
                            setRating(event.target.value)
                          }
                        >
                          {[5, 4, 3, 2, 1].map((value) => (
                            <option
                              key={value}
                              value={value}
                            >
                              {"★".repeat(value)}
                              {"☆".repeat(5 - value)}{" "}
                              — {value}/5
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Comment */}
                      <div>
                        <label
                          htmlFor="business-review"
                          className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                        >
                          Your Review
                        </label>

                        <textarea
                          id="business-review"
                          rows={4}
                          maxLength={1000}
                          placeholder="Tell the community about your experience..."
                          value={comment}
                          onChange={(event) =>
                            setComment(event.target.value)
                          }
                          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />

                        <div className="mt-1 text-right text-xs text-gray-400">
                          {comment.length}/1000
                        </div>
                      </div>

                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button
                        type="submit"
                        loading={submitting}
                      >
                        ⭐ Submit Review
                      </Button>
                    </div>

                  </form>
                ) : (
                  <div className="mb-8 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800/50">

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-xl dark:bg-primary-900/30">
                      🔐
                    </div>

                    <h3 className="mt-3 font-bold text-gray-900 dark:text-white">
                      Want to leave a review?
                    </h3>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Login to share your experience with this business.
                    </p>

                    <Link
                      to="/login"
                      className="mt-4 inline-flex rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
                    >
                      Login to Review
                    </Link>

                  </div>
                )}

                {/* =================================================
                    REVIEW LIST
                ================================================= */}

                {reviews.length === 0 ? (
                  <div className="py-10 text-center">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl dark:bg-gray-800">
                      💬
                    </div>

                    <h3 className="mt-4 font-bold text-gray-900 dark:text-white">
                      No reviews yet
                    </h3>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Be the first person to review this business.
                    </p>

                  </div>
                ) : (
                  <div className="space-y-5">

                    {reviews.map((review) => (

                      <article
                        key={review._id}
                        className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5 transition hover:border-gray-200 hover:bg-white dark:border-gray-800 dark:bg-gray-800/40 dark:hover:bg-gray-800"
                      >

                        {/* User row */}
                        <div className="flex items-start justify-between gap-4">

                          <div className="flex min-w-0 items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                              {(review.reviewer?.name ||
                                "U")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">

                              <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                                {review.reviewer?.name ||
                                  "Community User"}
                              </p>

                              <p className="mt-0.5 text-xs text-gray-400">
                                {formatRelative(
                                  review.createdAt
                                )}
                              </p>

                            </div>

                          </div>

                          <div className="shrink-0 rounded-lg bg-yellow-50 px-2.5 py-1 text-sm tracking-wide text-yellow-500 dark:bg-yellow-900/20">
                            {"★".repeat(review.rating)}
                            <span className="text-gray-300 dark:text-gray-600">
                              {"★".repeat(
                                5 - review.rating
                              )}
                            </span>
                          </div>

                        </div>

                        {/* Comment */}
                        {review.comment && (
                          <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
                            {review.comment}
                          </p>
                        )}

                        {/* Owner response */}
                        {review.ownerResponse?.content && (
                          <div className="mt-4 rounded-xl border border-primary-100 bg-primary-50 p-4 dark:border-primary-900/30 dark:bg-primary-900/10">

                            <div className="flex items-center gap-2">
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-sm dark:bg-primary-900/40">
                                🏪
                              </span>

                              <span className="text-xs font-bold uppercase tracking-wide text-primary-700 dark:text-primary-300">
                                Owner Response
                              </span>
                            </div>

                            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                              {review.ownerResponse.content}
                            </p>

                          </div>
                        )}

                      </article>

                    ))}

                  </div>
                )}

              </div>

            </section>

          </div>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">

            {/* Quick contact */}
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

              <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                <h2 className="font-bold text-gray-900 dark:text-white">
                  Quick Actions
                </h2>
              </div>

              <div className="space-y-3 p-5">

                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 transition hover:border-green-200 hover:bg-green-50 dark:border-gray-700 dark:hover:bg-green-900/10"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-lg dark:bg-green-900/20">
                      📞
                    </span>

                    <div>
                      <p className="text-xs text-gray-400">
                        Call
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {business.phone}
                      </p>
                    </div>
                  </a>
                )}

                {business.email && (
                  <a
                    href={`mailto:${business.email}`}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 transition hover:border-blue-200 hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-blue-900/10"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg dark:bg-blue-900/20">
                      ✉️
                    </span>

                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">
                        Email
                      </p>
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {business.email}
                      </p>
                    </div>
                  </a>
                )}

                {business.website && (
                  <a
                    href={
                      business.website.startsWith("http")
                        ? business.website
                        : `https://${business.website}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 transition hover:border-purple-200 hover:bg-purple-50 dark:border-gray-700 dark:hover:bg-purple-900/10"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-lg dark:bg-purple-900/20">
                      🌐
                    </span>

                    <div>
                      <p className="text-xs text-gray-400">
                        Website
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Visit website
                      </p>
                    </div>
                  </a>
                )}

              </div>

            </section>

            {/* Back button */}
            <Link
              to="/businesses"
              className="flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-primary-900/10"
            >
              ← Explore More Businesses
            </Link>

          </aside>

        </div>

      </div>

    </main>
  );
}