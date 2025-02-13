import Menu from "../../components/Menu/Menu.tsx";
import Dashboard from "../../components/Dashboard/Dashboard.tsx";
import Icon from "../../components/Icon.tsx";
import Button from "../../components/Button.tsx";

export default function SMM() {

  const breadcrumbItems = [
    { label: "Admin" },
    { label: "Rețele sociale" },
    { label: "Dashboard" }
]
  return (
  <>
    <Menu active="Rețele sociale"/>
    <Dashboard breadcrumb={breadcrumbItems} menu="social" active="Dashboard">
      <div>
        <Button> Export
        <Icon type={"arrow_right"}/>
      </Button>
      </div>
    </Dashboard>
  </>
  );
}
