import Menu from "../../components/Menu/Menu.tsx";
import Dashboard from "../../components/Dashboard/Dashboard.tsx";

export default function SmmStatistics() {

  const breadcrumbItems = [
    { label: "Admin" },
    { label: "Rețele sociale" },
    { label: "Statistics" }
]
  return (
  <>
    <Menu active="Rețele sociale"/>
    <Dashboard breadcrumb={breadcrumbItems} menu="social" active="Statistics">
      <div>

      </div>
    </Dashboard>
  </>
  );
}
