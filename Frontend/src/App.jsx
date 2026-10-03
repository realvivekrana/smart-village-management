import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import Loader from "./components/common/Loader";
import { LightboxProvider } from "./components/common/ImageLightbox";
import useActivityTracker from "./hooks/useActivityTracker";

function App() {
  useActivityTracker();

  return (
    <LightboxProvider>
      <Toaster position="top-right" />
      <Suspense fallback={<Loader fullScreen />}>
        <AppRoutes />
      </Suspense>
    </LightboxProvider>
  );
}

export default App;