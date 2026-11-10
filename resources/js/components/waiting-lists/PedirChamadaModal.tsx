import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Props {
    open: boolean;
    onClose: () => void;
    doente: any | null;
}

export default function PedirChamadaModal({ open, onClose, doente }: Props) {
    const [form, setForm] = useState({
        tipo_chamada: '',
        data_pretendida: '',
        observacoes: '',
    });

    const [loading, setLoading] = useState(false);

    function update(field: string, value: any) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function submit() {
        if (!doente) return;

        setLoading(true);

        router.post(`/waiting-list/${doente}/pedir-chamada`, form, {
            preserveScroll: true,
            onSuccess: () => {
                setLoading(false);
                onClose();
                setForm({
                    tipo_chamada: '',
                    data_pretendida: '',
                    observacoes: '',
                });
                toast.success('asdas');
            },
            onError: () => setLoading(false),
        });
    }

    if (!doente) return null;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Pedir Chamada para {doente}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Tipo de chamada</Label>
                        <Select value={form.tipo_chamada} onValueChange={(value) => update('tipo_chamada', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Ambulatorio">Ambulatório</SelectItem>
                                <SelectItem value="Base">Base</SelectItem>
                                <SelectItem value="SIGIC">SIGIC</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Data pretendida</Label>
                        <Input type="date" value={form.data_pretendida} onChange={(e) => update('data_pretendida', e.target.value)} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Observações</Label>
                        <Textarea value={form.observacoes} onChange={(e) => update('observacoes', e.target.value)} className="h-24" />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button onClick={submit} disabled={loading}>
                        {loading && <LoaderCircle className="size-4 animate-spin" />}
                        {loading ? 'A enviar...' : 'Enviar pedido'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
