import React, { useEffect, useMemo, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const VillageGallery = () => {
  const [village, setVillage] = useState(null);
  const [images, setImages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchVillage = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/village`);

        if (!response.ok) {
          throw new Error(
            `Failed to load village gallery (${response.status})`
          );
        }

        const result = await response.json();

        const data =
          result?.data ||
          result?.village ||
          result;

        if (!data) {
          throw new Error("Village information not found");
        }

        setVillage(data);

        const villageImages = Array.isArray(data.images)
          ? data.images
          : [];

        const normalizedImages = villageImages
          .map((image, index) => {
            if (typeof image === "string") {
              return {
                id: `${image}-${index}`,
                url: image,
                title: data.name || "Village",
                caption: "",
                category: "Village",
              };
            }

            if (!image?.url) {
              return null;
            }

            return {
              id: image._id || `${image.url}-${index}`,
              url: image.url,
              title:
                image.title ||
                image.name ||
                data.name ||
                "Village",
              caption: image.caption || image.description || "",
              category:
                image.category ||
                image.type ||
                "Village",
            };
          })
          .filter(Boolean);

        setImages(normalizedImages);
      } catch (err) {
        console.error("Village gallery error:", err);

        setError(
          err.message ||
            "Unable to load village gallery."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVillage();
  }, []);

  const filteredImages = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return images;
    }

    return images.filter((image) => {
      return (
        image.title
          ?.toLowerCase()
          .includes(keyword) ||
        image.caption
          ?.toLowerCase()
          .includes(keyword) ||
        image.category
          ?.toLowerCase()
          .includes(keyword)
      );
    });
  }, [images, search]);

  const openImage = (image) => {
    setSelectedImage(image);
  };

  const closeImage = () => {
    setSelectedImage(null);
  };

  const showPrevious = () => {
    if (!selectedImage || filteredImages.length === 0) {
      return;
    }

    const currentIndex = filteredImages.findIndex(
      (image) => image.id === selectedImage.id
    );

    const previousIndex =
      currentIndex <= 0
        ? filteredImages.length - 1
        : currentIndex - 1;

    setSelectedImage(filteredImages[previousIndex]);
  };

  const showNext = () => {
    if (!selectedImage || filteredImages.length === 0) {
      return;
    }

    const currentIndex = filteredImages.findIndex(
      (image) => image.id === selectedImage.id
    );

    const nextIndex =
      currentIndex >= filteredImages.length - 1
        ? 0
        : currentIndex + 1;

    setSelectedImage(filteredImages[nextIndex]);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!selectedImage) {
        return;
      }

      if (event.key === "Escape") {
        closeImage();
      }

      if (event.key === "ArrowLeft") {
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        showNext();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [selectedImage, filteredImages]);

  if (loading) {
    return (
      <main className="min-h-[500px] bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />

          <p className="mt-4 text-sm text-gray-500">
            Loading village gallery...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-[500px] bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <h1 className="text-xl font-semibold text-red-700">
            Gallery Unavailable
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-600">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-100">
              Village Gallery
            </p>

            <h1 className="mt-2 text-4xl font-bold text-white sm:text-5xl">
              {village?.name || "Village"} Gallery
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-blue-50">
              Explore photos and memories from{" "}
              {village?.name || "the village"}.
            </p>
          </div>
        </section>

        {/* Search / Info */}
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Village Photos
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Showing {filteredImages.length} of{" "}
                {images.length} photos
              </p>
            </div>

            {images.length > 0 && (
              <div className="w-full md:max-w-sm">
                <label className="sr-only">
                  Search gallery
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    🔍
                  </span>

                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search gallery..."
                    className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Gallery */}
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          {filteredImages.length === 0 ? (
            <EmptyGallery search={search} />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredImages.map((image) => (
                <GalleryCard
                  key={image.id}
                  image={image}
                  onClick={() => openImage(image)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={closeImage}
        >
          <button
            type="button"
            onClick={closeImage}
            aria-label="Close image"
            className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            ×
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showPrevious();
            }}
            aria-label="Previous image"
            className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            ‹
          </button>

          <div
            className="relative flex max-h-[90vh] max-w-6xl flex-col items-center"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="max-h-[75vh] max-w-full rounded-xl object-contain shadow-2xl"
            />

            <div className="mt-4 max-w-2xl text-center">
              <h3 className="text-lg font-semibold text-white">
                {selectedImage.title}
              </h3>

              {selectedImage.caption && (
                <p className="mt-1 text-sm leading-6 text-gray-300">
                  {selectedImage.caption}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
            aria-label="Next image"
            className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
};

const GalleryCard = ({
  image,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={image.url}
          alt={image.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

        <div className="absolute bottom-0 left-0 right-0 translate-y-3 p-4 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <p className="text-sm font-semibold text-white">
            View Photo
          </p>
        </div>
      </div>

      <div className="p-4">
        <p className="text-sm font-semibold text-gray-900">
          {image.title}
        </p>

        {image.category && (
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-blue-600">
            {image.category}
          </p>
        )}

        {image.caption && (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
            {image.caption}
          </p>
        )}
      </div>
    </button>
  );
};

const EmptyGallery = ({ search }) => {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center">
      <div className="text-6xl">🖼️</div>

      <h2 className="mt-5 text-xl font-bold text-gray-900">
        {search
          ? "No matching photos"
          : "No photos available"}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        {search
          ? `No gallery photo matches "${search}". Try another search.`
          : "Village photos will appear here once they are added by the administrator."}
      </p>
    </div>
  );
};

export default VillageGallery;