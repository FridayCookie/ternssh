import { I18nProvider } from "@/i18n";
import { ThemeProvider } from "@/theme";
import { DashboardView } from "@/dashboard/DashboardView";

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <div className="app-shell">
          <DashboardView />
        </div>
      </I18nProvider>
    </ThemeProvider>
  );
}
