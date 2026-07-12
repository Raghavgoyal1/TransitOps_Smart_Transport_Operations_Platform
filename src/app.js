import { BrowserRouter, Routes, Route, Navigate } from \"react-router-dom\";
import { AuthProvider, useAuth } from \"@/lib/auth\";
import { Toaster } from \"sonner\";
import Landing from \"@/pages/Landing\";
import Login from \"@/pages/Login\";
import Register from \"@/pages/Register\";
import DashboardLayout from \"@/components/DashboardLayout\";
import Overview from \"@/pages/dashboard/Overview\";
import Vehicles from \"@/pages/dashboard/Vehicles\";
import Drivers from \"@/pages/dashboard/Drivers\";
import Routes_ from \"@/pages/dashboard/Routes\";
import Trips from \"@/pages/dashboard/Trips\";
import LiveTracking from \"@/pages/dashboard/LiveTracking\";
import Fuel from \"@/pages/dashboard/Fuel\";
import Maintenance from \"@/pages/dashboard/Maintenance\";
import Analytics from \"@/pages/dashboard/Analytics\";
import AIAssistant from \"@/pages/dashboard/AIAssistant\";
import Notifications from \"@/pages/dashboard/Notifications\";
import Settings from \"@/pages/dashboard/Settings\";
import \"@/App.css\";

function Protected({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to=\"/login\" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position=\"top-right\" theme=\"dark\" richColors />
        <Routes>
          <Route path=\"/\" element={<Landing />} />
          <Route path=\"/login\" element={<Login />} />
          <Route path=\"/register\" element={<Register />} />
          <Route path=\"/dashboard\" element={<Protected><DashboardLayout /></Protected>}>
            <Route index element={<Overview />} />
            <Route path=\"vehicles\" element={<Vehicles />} />
            <Route path=\"drivers\" element={<Drivers />} />
            <Route path=\"routes\" element={<Routes_ />} />
            <Route path=\"trips\" element={<Trips />} />
            <Route path=\"tracking\" element={<LiveTracking />} />
            <Route path=\"fuel\" element={<Fuel />} />
            <Route path=\"maintenance\" element={<Maintenance />} />
            <Route path=\"analytics\" element={<Analytics />} />
            <Route path=\"ai\" element={<AIAssistant />} />
            <Route path=\"notifications\" element={<Notifications />} />
            <Route path=\"settings\" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
