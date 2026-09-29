import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import Loader from "./components/common/Loader";

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Suspense fallback={<Loader fullScreen />}>
        <AppRoutes />
      </Suspense>
    </>
  );
}

export default App;