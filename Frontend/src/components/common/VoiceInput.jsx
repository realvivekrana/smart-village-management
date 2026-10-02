import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import { useLanguage } from "../../context/LanguageContext";

/*
|--------------------------------------------------------------------------
| Voice Input Component
|--------------------------------------------------------------------------
| Gaon ke users ke liye voice se form input.
|
| Supports:
| - Hindi voice input
| - English voice input
| - Start / Stop recording
| - Interim results
| - Final results
| - Browser support detection
| - Error handling
|
| Usage:
|
| <VoiceInput
|   value={message}
|   onChange={setMessage}
| />
|--------------------------------------------------------------------------
*/

export default function VoiceInput({
  value = "",
  onChange,
  placeholder = "",
  className = "",
  disabled = false,
  multiline = true,
  rows = 4,
  autoFocus = false,
  id,
  maxLength,
  required = false,
  minLength,
}) {
  const { language, t } =
    useLanguage();

  const recognitionRef =
    useRef(null);

  /*
   * Keep latest value/onChange in refs. The recognition handlers are
   * created once per language, so reading props directly inside them
   * would use a stale (usually empty) value and overwrite typed text.
   */
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
  });

  const [
    isListening,
    setIsListening,
  ] = useState(false);

  const [
    isSupported,
    setIsSupported,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    interimText,
    setInterimText,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Browser Speech Recognition
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.continuous = true;

    recognition.interimResults = true;

    /*
     * Language:
     * Hindi -> hi-IN
     * English -> en-IN
     */
    recognition.lang =
      language === "hi"
        ? "hi-IN"
        : "en-IN";

    /*
     |--------------------------------------------------------------------------
     | Result
     |--------------------------------------------------------------------------
     */

    recognition.onresult =
      (event) => {
        let finalText = "";
        let currentInterim = "";

        for (
          let i = event.resultIndex;
          i < event.results.length;
          i++
        ) {
          const result =
            event.results[i];

          const transcript =
            result[0]?.transcript ||
            "";

          if (
            result.isFinal
          ) {
            finalText +=
              transcript;
          } else {
            currentInterim +=
              transcript;
          }
        }

        setInterimText(
          currentInterim
        );

        if (
          finalText.trim()
        ) {
          const existingText =
            valueRef.current?.trim() || "";

          const separator =
            existingText
              ? " "
              : "";

          const nextValue =
            `${existingText}${separator}${finalText.trim()}`;

          valueRef.current = nextValue;
          onChangeRef.current?.(nextValue);
        }
      };

    /*
     |--------------------------------------------------------------------------
     | Start
     |--------------------------------------------------------------------------
     */

    recognition.onstart =
      () => {
        setIsListening(true);
        setError("");
      };

    /*
     |--------------------------------------------------------------------------
     | End
     |--------------------------------------------------------------------------
     */

    recognition.onend =
      () => {
        setIsListening(false);
        setInterimText("");
      };

    /*
     |--------------------------------------------------------------------------
     | Error
     |--------------------------------------------------------------------------
     */

    recognition.onerror =
      (event) => {
        setIsListening(false);
        setInterimText("");

        switch (
          event.error
        ) {
          case "not-allowed":
          case "permission-denied":
            setError(
              t(
                "voice.permissionDenied"
              )
            );
            break;

          case "no-speech":
            setError(
              t(
                "voice.speakNow"
              )
            );
            break;

          case "audio-capture":
            setError(
              t("voice.micUnavailable")
            );
            break;

          case "network":
            setError(
              t("voice.networkError")
            );
            break;

          default:
            setError(
              t("voice.startFailed")
            );
        }
      };

    recognitionRef.current =
      recognition;

    /*
     |--------------------------------------------------------------------------
     | Cleanup
     |--------------------------------------------------------------------------
     */

    return () => {
      try {
        recognition.stop();
      } catch (error) {
        // Recognition already stopped.
      }

      recognitionRef.current =
        null;
    };
  }, [language]);

  /*
  |--------------------------------------------------------------------------
  | Start Voice Input
  |--------------------------------------------------------------------------
  */

  const startListening =
    () => {
      if (disabled) {
        return;
      }

      if (!isSupported) {
        setError(
          t(
            "voice.notSupported"
          )
        );

        return;
      }

      if (
        !recognitionRef.current
      ) {
        setError(
          t(
            "voice.notSupported"
          )
        );

        return;
      }

      try {
        setError("");
        setInterimText("");

        recognitionRef.current.start();
      } catch (error) {
        /*
         * Browser throws an error if start()
         * is called while recognition is already active.
         */
        if (
          error?.name !==
          "InvalidStateError"
        ) {
          setError(
            t("voice.unableToStart")
          );
        }
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Stop Voice Input
  |--------------------------------------------------------------------------
  */

  const stopListening =
    () => {
      if (
        !recognitionRef.current
      ) {
        return;
      }

      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.warn(
          "Unable to stop speech recognition:",
          error
        );
      }

      setIsListening(false);
      setInterimText("");
    };

  /*
  |--------------------------------------------------------------------------
  | Toggle
  |--------------------------------------------------------------------------
  */

  const toggleListening =
    () => {
      if (isListening) {
        stopListening();
      } else {
        startListening();
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Manual text change
  |--------------------------------------------------------------------------
  */

  const handleTextChange =
    (event) => {
      onChange?.(
        event.target.value
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Unsupported browser
  |--------------------------------------------------------------------------
  */

  if (!isSupported) {
    return (
      <div
        className={`w-full ${className}`}
      >
        <div className="relative">
          {multiline ? (
            <textarea
              value={value}
              onChange={
                handleTextChange
              }
              rows={rows}
              placeholder={placeholder}
            id={id}
            maxLength={maxLength}
            required={required}
            minLength={minLength}
              autoFocus={
                autoFocus
              }
              disabled={
                disabled
              }
              className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 pr-14 text-base sm:text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={
                handleTextChange
              }
              placeholder={placeholder}
            id={id}
            maxLength={maxLength}
            required={required}
            minLength={minLength}
              autoFocus={
                autoFocus
              }
              disabled={
                disabled
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-14 text-base sm:text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            />
          )}
        </div>

        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {t(
            "voice.notSupported"
          )}
        </p>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Main Component
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className={`w-full ${className}`}
    >
      <div className="relative">
        {multiline ? (
          <textarea
            value={value}
            onChange={
              handleTextChange
            }
            rows={rows}
            placeholder={placeholder}
            id={id}
            maxLength={maxLength}
            required={required}
            minLength={minLength}
            autoFocus={
              autoFocus
            }
            disabled={
              disabled
            }
            className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 pr-16 text-base sm:text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={
              handleTextChange
            }
            placeholder={placeholder}
            id={id}
            maxLength={maxLength}
            required={required}
            minLength={minLength}
            autoFocus={
              autoFocus
            }
            disabled={
              disabled
            }
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-16 text-base sm:text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />
        )}

        {/* Voice Button */}
        <button
          type="button"
          onClick={
            toggleListening
          }
          disabled={disabled}
          aria-label={
            isListening
              ? t(
                  "voice.stop"
                )
              : t(
                  "voice.start"
                )
          }
          title={
            isListening
              ? t(
                  "voice.stop"
                )
              : t(
                  "voice.start"
                )
          }
          className={`
            absolute right-3 top-3
            flex h-10 w-10
            items-center justify-center
            rounded-full
            text-lg
            transition-all
            duration-200
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            disabled:cursor-not-allowed
            disabled:opacity-50
            ${
              isListening
                ? "animate-pulse bg-red-600 text-white shadow-lg"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }
          `}
        >
          {isListening
            ? "■"
            : "🎤"}
        </button>
      </div>

      {/* Listening status */}
      {isListening && (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
          </span>

          <span>
            {t(
              "voice.listening"
            )}
          </span>
        </div>
      )}

      {/* Interim transcript */}
      {interimText && (
        <div className="mt-2 rounded-lg border border-dashed border-blue-300 bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:border-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
          <span className="font-medium">
            {language === "hi"
              ? "सुन रहा हूँ: "
              : "Listening: "}
          </span>

          {interimText}
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Language hint */}
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {language === "hi"
          ? t("voice.micHintHi")
          : t("voice.micHintEn")}
      </p>
    </div>
  );
}