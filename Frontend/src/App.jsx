import { Suspense } from "react";
import AppRoutes from "./routes/AppRoutes";
import Loader from "./components/common/Loader";

function App() {
  return (
    <Suspense fallback={<Loader fullScreen />}>
      <AppRoutes />
    </Suspense>
  );
}

export default App;