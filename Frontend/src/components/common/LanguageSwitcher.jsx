
import React from "react";
import {
  LANGUAGES,
  useLanguage,
} from "../../context/LanguageContext";

/*
|--------------------------------------------------------------------------
| Language Switcher
|--------------------------------------------------------------------------
| Hindi / English language switch ke liye reusable component.
|
| Use:
|
| <LanguageSwitcher />
|
| Ya:
|
| <LanguageSwitcher compact />
|
|--------------------------------------------------------------------------
*/

export default function LanguageSwitcher({
  compact = false,
  className = "",
}) {
  const {
    language,
    setLanguage,
    t,
  } = useLanguage();

  const isHindi =
    language === LANGUAGES.HINDI;

  /*
  |--------------------------------------------------------------------------
  | Handle language change
  |--------------------------------------------------------------------------
  */

  const handleLanguageChange =
    (newLanguage) => {
      if (
        newLanguage === language
      ) {
        return;
      }

      setLanguage(newLanguage);
    };

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}
      role="group"
      aria-label="Language selection"
    >
      {/* Hindi */}
      <button
        type="button"
        onClick={() =>
          handleLanguageChange(
            LANGUAGES.HINDI
          )
        }
        className={`
          inline-flex items-center justify-center
          rounded-lg px-3 py-2
          text-sm font-medium
          transition-all duration-200
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
          ${
            isHindi
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          }
        `}
        aria-pressed={isHindi}
        title="हिंदी"
      >
        <span
          aria-hidden="true"
          className="mr-1.5"
        >
          अ
        </span>

        {!compact && (
          <span>
            हिन्दी
          </span>
        )}
      </button>

      {/* English */}
      <button
        type="button"
        onClick={() =>
          handleLanguageChange(
            LANGUAGES.ENGLISH
          )
        }
        className={`
          inline-flex items-center justify-center
          rounded-lg px-3 py-2
          text-sm font-medium
          transition-all duration-200
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
          ${
            !isHindi
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          }
        `}
        aria-pressed={!isHindi}
        title="English"
      >
        <span
          aria-hidden="true"
          className="mr-1.5"
        >
          A
        </span>

        {!compact && (
          <span>
            English
          </span>
        )}
      </button>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Simple Toggle Version
|--------------------------------------------------------------------------
| Agar header mein sirf ek compact button chahiye
|--------------------------------------------------------------------------
*/

export function LanguageToggle({
  className = "",
}) {
  const {
    language,
    toggleLanguage,
  } = useLanguage();

  const isHindi =
    language === LANGUAGES.HINDI;

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`
        inline-flex items-center gap-2
        rounded-lg border border-gray-200
        bg-white px-3 py-2
        text-sm font-medium
        text-gray-700
        shadow-sm
        transition
        hover:bg-gray-50
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
        dark:border-gray-700
        dark:bg-gray-800
        dark:text-gray-200
        dark:hover:bg-gray-700
        ${className}
      `}
      aria-label={
        isHindi
          ? "Switch to English"
          : "हिंदी में बदलें"
      }
      title={
        isHindi
          ? "Switch to English"
          : "हिंदी में बदलें"
      }
    >
      <span
        className="text-base"
        aria-hidden="true"
      >
        {isHindi
          ? "अ"
          : "A"}
      </span>

      <span>
        {isHindi
          ? "English"
          : "हिन्दी"}
      </span>
    </button>
  );
}