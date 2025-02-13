import Menu from "../../components/Menu/Menu.tsx";
import Dashboard from "../../components/Dashboard/Dashboard.tsx";

export default function SmmAdd() {

  const breadcrumbItems = [
    { label: "Admin" },
    { label: "Rețele sociale" },
    { label: "Add" }
]
  return (
  <>
    <Menu active="Rețele sociale"/>
    <Dashboard breadcrumb={breadcrumbItems} menu="social" active="Add">
      <div>

      </div>
    </Dashboard>
  </>
  );
}
