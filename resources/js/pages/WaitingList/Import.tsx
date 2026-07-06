import { useState } from "react";
import { router } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Importar Lista de Espera',
        href: '/waiting-list/import',
    },
];

export default function ImportExcel() {
  const [file, setFile] = useState<File | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!file) return;

    router.post('/waiting-list/import', {
      file,
    }, {
      forceFormData: true,
      onSuccess: () => alert("Importação concluída"),
      onError: () => alert("Erro ao importar Excel"),
    });
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Importar Lista de Espera" />

    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Importar Lista de Espera (Excel)</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="border p-2"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Importar Excel
        </button>
      </form>
    </div>
    </AppLayout>
  );
}
