import { BrowserRouter } from "react-router-dom";
import { ScrollToTopButton } from "@/shared/components/scroll-to-top-button";
import { AppLayout } from "./layout/app-layout";
import { AppRouter } from "./app-router";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTopButton />
      <AppLayout>
        <AppRouter />
      </AppLayout>
    </BrowserRouter>
  );
}
