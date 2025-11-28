import PageHeader from "@/components/layout/PageHeader";

export default function Page() {
  return (
    <main>
      <PageHeader
        title="Parceiros do Projeto"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Parceiros do Projeto" },
        ]}
      />
    </main>
  );
}
