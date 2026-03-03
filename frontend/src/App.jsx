import { RouterProvider } from "react-router-dom";
import router from "./router";
import Toast from "./components/shared/Toast";

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toast />
    </>
  );
}

export default App;
