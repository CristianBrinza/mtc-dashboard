import Menu from "../../components/Menu/Menu.tsx";
import Dashboard from "../../components/Dashboard/Dashboard.tsx";
import Icon from "../../components/Icon.tsx";
import React from "react";
import Button from "../../components/Button.tsx";

export default function SMM() {

  const breadcrumbItems = [
    { label: "Admin" },
    { label: "Rețele sociale" },
    { label: "SMM" }
]
  return (
  <>
    <Menu active="Rețele sociale"/>
    <Dashboard breadcrumb={breadcrumbItems} menu="social" active="Dashboard">
      <div>
        <Button>
        <Icon type={"arrow_right"}/>
      </Button>
      </div>
    </Dashboard>
  </>
  );
}
