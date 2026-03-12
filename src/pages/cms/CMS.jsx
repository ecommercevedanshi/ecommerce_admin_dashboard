import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import DataTable from "../../components/ui/DataTable";

const CMS = () => {

  const bannerColumns = [
    "Banner",
    "Title",
    "Status",
    "Position",
    "Action"
  ];

  const bannerData = [
    ["Banner 1", "Summer Sale", "Active", "Homepage Top", "Edit"],
    ["Banner 2", "New Arrivals", "Active", "Homepage Middle", "Edit"],
    ["Banner 3", "Winter Collection", "Inactive", "Homepage Bottom", "Edit"]
  ];


  const promoColumns = [
    "Section",
    "Page",
    "Status",
    "Last Updated",
    "Action"
  ];

  const promoData = [
    ["Featured Products", "Homepage", "Active", "10 Apr 2025", "Edit"],
    ["Top Deals", "Homepage", "Active", "05 Apr 2025", "Edit"],
    ["Trending Items", "Shop Page", "Inactive", "20 Mar 2025", "Edit"]
  ];


  const staticColumns = [
    "Page Name",
    "Slug",
    "Last Updated",
    "Status",
    "Action"
  ];

  const staticData = [
    ["About Us", "/about", "01 Jan 2025", "Published", "Edit"],
    ["Privacy Policy", "/privacy", "10 Feb 2025", "Published", "Edit"],
    ["Terms & Conditions", "/terms", "20 Feb 2025", "Published", "Edit"]
  ];


  return (
    <div className="space-y-6">

      {/* Stats */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

        <StatCard label="Homepage Banners" value="3" />

        <StatCard label="Promotional Sections" value="6" />

        <StatCard label="Static Pages" value="5" />

      </div>


      {/* Banners */}

      <Card title="Homepage Banners">

        <DataTable
          columns={bannerColumns}
          data={bannerData}
        />

      </Card>


      {/* Promotional Sections */}

      <Card title="Promotional Sections">

        <DataTable
          columns={promoColumns}
          data={promoData}
        />

      </Card>


      {/* Static Pages */}

      <Card title="Static Pages">

        <DataTable
          columns={staticColumns}
          data={staticData}
        />

      </Card>

    </div>
  );
};

export default CMS;