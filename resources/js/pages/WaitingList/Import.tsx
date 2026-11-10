import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { FileSpreadsheet, LoaderCircle, Upload, UploadCloud } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Importar Lista de Espera',
        href: '/waiting-list/import',
    },
];

export default function ImportExcel() {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [processing, setProcessing] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!file) return;

        setProcessing(true);

        router.post(
            '/waiting-list/import',
            {
                file,
            },
            {
                forceFormData: true,
                onSuccess: () => {
                    setProcessing(false);
                    alert('Importação concluída');
                },
                onError: () => {
                    setProcessing(false);
                    alert('Erro ao importar Excel');
                },
            },
        );
    }

    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setIsDragging(false);

        const dropped = e.dataTransfer.files?.[0];
        if (dropped) setFile(dropped);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Importar Lista de Espera" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="Importar Lista de Espera"
                    description="Carrega um ficheiro Excel (.xlsx ou .xls) para atualizar a lista de espera cirúrgica."
                    icon={<FileSpreadsheet className="size-5" />}
                />

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="max-w-xl rounded-xl border border-border bg-card p-6 shadow-sm"
                >
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <label
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
                                isDragging ? 'border-primary bg-accent' : 'border-border bg-muted/30 hover:bg-muted/50'
                            }`}
                        >
                            <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
                                <UploadCloud className="size-6" />
                            </div>

                            {file ? (
                                <div>
                                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                                    <p className="text-muted-foreground mt-1 text-xs">{(file.size / 1024).toFixed(0)} KB · Clica para substituir</p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-sm font-medium text-foreground">Arrasta o ficheiro para aqui</p>
                                    <p className="text-muted-foreground mt-1 text-xs">ou clica para selecionar um ficheiro .xlsx / .xls</p>
                                </div>
                            )}

                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                                className="hidden"
                            />
                        </label>

                        <Button type="submit" disabled={!file || processing} className="w-full">
                            {processing ? <LoaderCircle className="size-4 animate-spin" /> : <Upload className="size-4" />}
                            Importar Excel
                        </Button>
                    </form>
                </motion.div>
            </div>
        </AppLayout>
    );
}
